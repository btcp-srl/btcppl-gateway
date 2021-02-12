import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class User {
  
  @ObjectIdColumn()
  _id: string;

  @Column()
  level: string;

  @Column()
  role: string;

  @Column()
  token: string;

  @Column()
  doc_hash: string;
  
  @Column()
  restore_token: string;

  @Column()
  validated: boolean;

  @Column()
  is_active: boolean;

  // User definition
  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;

  @Column()
  phd: string;

  @Column()
  password: string;

  @Column()
  country: string;

  @Column()
  address_1: string;

  @Column()
  address_2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  gender: string;

  @Column()
  blood: string;

  @Column()
  cf: string;

  @Column()
  birth_place: string;
  
  @Column()
  birth_date: string;
  
  @Column()
  phone: string;

  @Column()
  description: string;

  @Column()
  hash: string;

  @Column()
  xsid: string;

  @Column()
  xpub: string;

  @Column()
  address: string;

  @Column()
  timestamp_registration: number;

}