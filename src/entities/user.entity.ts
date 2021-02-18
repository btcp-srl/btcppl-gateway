import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class User {
  
  @ObjectIdColumn()
  _id: string;

  @Column()
  level: string;

  @Column()
  token: string;

  @Column()
  wallet: string;
  
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
  password: string;

  @Column()
  hash: string;

  @Column()
  xsid: string;

  @Column()
  xpub: string;

  @Column()
  timestamp_registration: number;

}