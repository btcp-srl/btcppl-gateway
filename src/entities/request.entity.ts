import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Request {

  @ObjectIdColumn()
  _id: string;

  @Column({ unique: true })
  checkoutID: string;

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
