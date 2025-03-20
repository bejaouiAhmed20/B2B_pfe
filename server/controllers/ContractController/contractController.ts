import { Request, Response } from 'express';
import { Contract } from '../../models/Contract';
import { User } from '../../models/User';

// Get all contracts
export const getContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find({
      relations: ['client']
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
      relations: ['client']
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
      relations: ['client']
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
      enableInternetFees,
      modifiedFeeAmount,
      toxlFee,
      twoHourConstraint,
      payLater,
      payLaterTimeLimit,
      minTimeBeforeCCFlight,
      minTimeBeforeBalanceFlight,
      invoiceStamp,
      finalClientAdditionalFees,
      discount
    } = req.body;
    
    // Check if client exists
    const client = await User.findOneBy({ id: client_id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
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
    contract.enableInternetFees = enableInternetFees || false;
    contract.modifiedFeeAmount = modifiedFeeAmount || null;
    contract.toxlFee = toxlFee || null;
    contract.twoHourConstraint = twoHourConstraint || null;
    contract.payLater = payLater || false;
    contract.payLaterTimeLimit = payLaterTimeLimit || null;
    contract.minTimeBeforeCCFlight = minTimeBeforeCCFlight || null;
    contract.minTimeBeforeBalanceFlight = minTimeBeforeBalanceFlight || null;
    contract.invoiceStamp = invoiceStamp || null;
    contract.finalClientAdditionalFees = finalClientAdditionalFees || null;
    contract.discount = discount || null;
    
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
      enableInternetFees,
      modifiedFeeAmount,
      toxlFee,
      twoHourConstraint,
      payLater,
      payLaterTimeLimit,
      minTimeBeforeCCFlight,
      minTimeBeforeBalanceFlight,
      invoiceStamp,
      finalClientAdditionalFees,
      discount
    } = req.body;
    
    // Update client if provided
    if (client_id) {
      const client = await User.findOneBy({ id: client_id });
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      contract.client = client;
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
    if (enableInternetFees !== undefined) contract.enableInternetFees = enableInternetFees;
    if (modifiedFeeAmount !== undefined) contract.modifiedFeeAmount = modifiedFeeAmount;
    if (toxlFee !== undefined) contract.toxlFee = toxlFee;
    if (twoHourConstraint !== undefined) contract.twoHourConstraint = twoHourConstraint;
    if (payLater !== undefined) contract.payLater = payLater;
    if (payLaterTimeLimit !== undefined) contract.payLaterTimeLimit = payLaterTimeLimit;
    if (minTimeBeforeCCFlight !== undefined) contract.minTimeBeforeCCFlight = minTimeBeforeCCFlight;
    if (minTimeBeforeBalanceFlight !== undefined) contract.minTimeBeforeBalanceFlight = minTimeBeforeBalanceFlight;
    if (invoiceStamp !== undefined) contract.invoiceStamp = invoiceStamp;
    if (finalClientAdditionalFees !== undefined) contract.finalClientAdditionalFees = finalClientAdditionalFees;
    if (discount !== undefined) contract.discount = discount;
    
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
  } catch (error: any) {
    console.error('Failed to delete contract:', error);
    res.status(500).json({ 
      message: 'Failed to delete contract',
      error: error.message
    });
  }
};