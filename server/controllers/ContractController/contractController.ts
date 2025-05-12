import { Request, Response } from 'express';
import { Contract } from '../../models/Contract';
import { User } from '../../models/User';
import { Coupon } from '../../models/Coupon';
import { LessThan, MoreThanOrEqual, Not } from 'typeorm';

// Get all contracts
export const getContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find({
      relations: ['client', 'coupon']
    });
    res.json(contracts);
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    res.status(500).json({ message: 'Failed to fetch contracts' });
  }
};

// Get contract by ID
export const getContractById = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findOne({
      where: { id: req.params.id },
      relations: ['client', 'coupon']
    });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error) {
    console.error('Failed to fetch contract:', error);
    res.status(500).json({ message: 'Failed to fetch contract' });
  }
};

// Get contracts by client ID
export const getContractsByClientId = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find({
      where: { client: { id: req.params.clientId } },
      relations: ['client', 'coupon']
    });
    
    res.json(contracts);
  } catch (error) {
    console.error('Failed to fetch client contracts:', error);
    res.status(500).json({ message: 'Failed to fetch client contracts' });
  }
};

// Create a new contract
export const createContract = async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      clientType,
      label,
      contractStartDate,
      contractEndDate,
      guaranteedMinimum,
      travelStartDate,
      travelEndDate,
      isActive,
      modifiedFeeAmount,
      payLater,
      payLaterTimeLimit,
      minTimeBeforeBalanceFlight,
      invoiceStamp,
      finalClientAdditionalFees,
      fixedTicketPrice,
      coupon
    } = req.body;
    
    // Check if client exists
    const client = await User.findOneBy({ id: client_id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Check if client already has an active contract that hasn't ended
    const currentDate = new Date();
    const existingActiveContract = await Contract.findOne({
      where: {
        client: { id: client_id },
        isActive: true,
        contractEndDate: MoreThanOrEqual(currentDate)
      }
    });
    
    if (existingActiveContract) {
      return res.status(400).json({ 
        message: 'Client already has an active contract. Please end the current contract before creating a new one.',
        existingContract: existingActiveContract
      });
    }
    
    const contract = new Contract();
    contract.client = client;
    contract.clientType = clientType;
    contract.label = label;
    contract.contractStartDate = new Date(contractStartDate);
    contract.contractEndDate = new Date(contractEndDate);
    contract.guaranteedMinimum = guaranteedMinimum;
    contract.travelStartDate = new Date(travelStartDate);
    contract.travelEndDate = new Date(travelEndDate);
    contract.isActive = isActive !== undefined ? isActive : true;
    contract.modifiedFeeAmount = modifiedFeeAmount || null;
    contract.payLater = payLater || false;
    contract.payLaterTimeLimit = payLater ? payLaterTimeLimit : null;
    contract.minTimeBeforeBalanceFlight = minTimeBeforeBalanceFlight || null;
    contract.invoiceStamp = invoiceStamp || null;
    contract.finalClientAdditionalFees = finalClientAdditionalFees || null;
    contract.fixedTicketPrice = fixedTicketPrice || null;
    
    // Handle coupon if provided
    if (coupon) {
      const couponEntity = await Coupon.findOneBy({ id: coupon });
      if (couponEntity) {
        contract.coupon = couponEntity;
      }
    }
    
    await contract.save();
    res.status(201).json(contract);
  } catch (error: any) {
    console.error('Failed to create contract:', error);
    res.status(500).json({ 
      message: 'Failed to create contract', 
      error: error.message 
    });
  }
};

// Update contract
export const updateContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findOneBy({ id: req.params.id });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    const {
      clientType,
      client_id,
      label,
      contractStartDate,
      contractEndDate,
      guaranteedMinimum,
      travelStartDate,
      travelEndDate,
      isActive,
      modifiedFeeAmount,
      payLater,
      payLaterTimeLimit,
      minTimeBeforeBalanceFlight,
      invoiceStamp,
      finalClientAdditionalFees,
      fixedTicketPrice,
      coupon
    } = req.body;
    
    // If client is being changed, check for existing active contracts
    if (client_id && client_id !== contract.client.id) {
      const currentDate = new Date();
      const existingActiveContract = await Contract.findOne({
        where: {
          client: { id: client_id },
          isActive: true,
          contractEndDate: MoreThanOrEqual(currentDate),
          id: Not(contract.id) // Fixed: Use Not() instead of $ne
        }
      });
      
      if (existingActiveContract) {
        return res.status(400).json({ 
          message: 'Client already has an active contract. Please end the current contract before assigning a new one.',
          existingContract: existingActiveContract
        });
      }
      
      // Update client if provided
      const client = await User.findOneBy({ id: client_id });
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      contract.client = client;
    }
    
    // If activating a contract, check if client already has an active contract
    if (isActive && !contract.isActive) {
      const currentDate = new Date();
      const existingActiveContract = await Contract.findOne({
        where: {
          client: { id: contract.client.id },
          isActive: true,
          contractEndDate: MoreThanOrEqual(currentDate),
          id: Not(contract.id) // Fixed: Use Not() instead of $ne
        }
      });
      
      if (existingActiveContract) {
        return res.status(400).json({ 
          message: 'Client already has an active contract. Please end the current contract before activating this one.',
          existingContract: existingActiveContract
        });
      }
    }
    
    // Update other fields if provided
    if (clientType !== undefined) contract.clientType = clientType;
    if (label !== undefined) contract.label = label;
    if (contractStartDate !== undefined) contract.contractStartDate = new Date(contractStartDate);
    if (contractEndDate !== undefined) contract.contractEndDate = new Date(contractEndDate);
    if (guaranteedMinimum !== undefined) contract.guaranteedMinimum = guaranteedMinimum;
    if (travelStartDate !== undefined) contract.travelStartDate = new Date(travelStartDate);
    if (travelEndDate !== undefined) contract.travelEndDate = new Date(travelEndDate);
    if (isActive !== undefined) contract.isActive = isActive;
    if (modifiedFeeAmount !== undefined) contract.modifiedFeeAmount = modifiedFeeAmount;
    if (payLater !== undefined) contract.payLater = payLater;
    
    // Only set payLaterTimeLimit if payLater is true
    if (payLater) {
      if (payLaterTimeLimit !== undefined) contract.payLaterTimeLimit = payLaterTimeLimit;
    } else {
      contract.payLaterTimeLimit = null;
    }
    
    if (minTimeBeforeBalanceFlight !== undefined) contract.minTimeBeforeBalanceFlight = minTimeBeforeBalanceFlight;
    if (invoiceStamp !== undefined) contract.invoiceStamp = invoiceStamp;
    if (finalClientAdditionalFees !== undefined) contract.finalClientAdditionalFees = finalClientAdditionalFees;
    if (fixedTicketPrice !== undefined) contract.fixedTicketPrice = fixedTicketPrice;
    
    // Handle coupon if provided
    if (coupon !== undefined) {
      if (coupon) {
        const couponEntity = await Coupon.findOneBy({ id: coupon });
        contract.coupon = couponEntity || null;
      } else {
        contract.coupon = null;
      }
    }
    
    await contract.save();
    res.json(contract);
  } catch (error: any) {
    console.error('Failed to update contract:', error);
    res.status(500).json({ 
      message: 'Failed to update contract',
      error: error.message
    });
  }
};

// Delete contract
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findOneBy({ id: req.params.id });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    await contract.remove();
    res.status(200).json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Failed to delete contract:', error);
    res.status(500).json({ message: 'Failed to delete contract' });
  }
};