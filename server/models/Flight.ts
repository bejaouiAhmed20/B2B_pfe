import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Reservation } from './Reservation'; 

@Entity()
export class Flight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  titre!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  prix!: number;

  @Column('datetime', { nullable: false })
  date_depart!: Date;

  @Column('datetime', { nullable: false })
  date_retour!: Date;

  @Column('varchar', { nullable: false })
  ville_depart!: string;

  @Column('varchar', { nullable: false })
  ville_arrivee!: string;

  @Column('varchar', { nullable: false })
  compagnie_aerienne!: string;

  @Column('varchar', { nullable: false })
  duree!: string;

  // Relation One-to-Many avec l'entité Reservation
  @OneToMany(() => Reservation, (reservation) => reservation.flight)
  reservations!: Reservation[];
  // Méthode de recherche statique pour les vols
  static async searchFlights(criteria: {
    titre?: string;
    prix_min?: number;
    prix_max?: number;
    date_depart_debut?: Date;
    date_depart_fin?: Date;
    date_retour_debut?: Date;
    date_retour_fin?: Date;
    ville_depart?: string;
    ville_arrivee?: string;
    compagnie_aerienne?: string;
    duree?: string;
  }) {
    const queryBuilder = this.createQueryBuilder('flight');

    if (criteria.titre) {
      queryBuilder.andWhere('flight.titre LIKE :titre', { titre: `%${criteria.titre}%` });
    }

    if (criteria.prix_min) {
      queryBuilder.andWhere('flight.prix >= :prix_min', { prix_min: criteria.prix_min });
    }

    if (criteria.prix_max) {
      queryBuilder.andWhere('flight.prix <= :prix_max', { prix_max: criteria.prix_max });
    }

    if (criteria.date_depart_debut) {
      queryBuilder.andWhere('flight.date_depart >= :date_depart_debut', { date_depart_debut: criteria.date_depart_debut });
    }

    if (criteria.date_depart_fin) {
      queryBuilder.andWhere('flight.date_depart <= :date_depart_fin', { date_depart_fin: criteria.date_depart_fin });
    }

    if (criteria.date_retour_debut) {
      queryBuilder.andWhere('flight.date_retour >= :date_retour_debut', { date_retour_debut: criteria.date_retour_debut });
    }

    if (criteria.date_retour_fin) {
      queryBuilder.andWhere('flight.date_retour <= :date_retour_fin', { date_retour_fin: criteria.date_retour_fin });
    }

    if (criteria.ville_depart) {
      queryBuilder.andWhere('flight.ville_depart LIKE :ville_depart', { ville_depart: `%${criteria.ville_depart}%` });
    }

    if (criteria.ville_arrivee) {
      queryBuilder.andWhere('flight.ville_arrivee LIKE :ville_arrivee', { ville_arrivee: `%${criteria.ville_arrivee}%` });
    }

    if (criteria.compagnie_aerienne) {
      queryBuilder.andWhere('flight.compagnie_aerienne LIKE :compagnie_aerienne', { compagnie_aerienne: `%${criteria.compagnie_aerienne}%` });
    }

    if (criteria.duree) {
      queryBuilder.andWhere('flight.duree LIKE :duree', { duree: `%${criteria.duree}%` });
    }

    return queryBuilder.getMany();
  }
}