import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class PoSRequest {

  @ObjectIdColumn()
  _id: string;

  @Column()
  amount: string;

  @Column()
  change: string;

  @Column()
  fiat: string;

  @Column({ default: '' })
  webHook: string;

  @Column({ default: '' })
  hookResolved: string;

  @Column()
  hashUser: string;

  @Column()
  path: string;

  @Column()
  address: string;

  @Column({length: 4000})
  qrcode: string;

  @Column()
  requestAddress: string;

  @Column({ length: 4000 })
  requestPath: string;

  @Column()
  status: string;

  @Column()
  timestamp: string;

  @Column({ default: '' })
  paidAt: string;

  @Column({ default: '' })
  paidTx: string;
}
