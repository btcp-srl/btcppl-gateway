"use strict";
const fs = require('fs')
const mongoose = require('mongoose')
require('dotenv').config()
const Schema = mongoose.Schema;

module Utilities {

    export class Logger {
        Log: any
        constructor() {
            if (this.Log === undefined) {
                this.Log = new Schema({
                    log: { type: String },
                    datatype: { type: String },
                    identifier: { type: String },
                    action: { type: String },
                    timestamp: { type: Number }
                });
            }
        }
        
        public async log(what, datatype = '', identifier = '', action = '', type = 'log') {
            const path = './logs/' + type

            try {
                if (!fs.existsSync('./logs/')) {
                    fs.mkdirSync('./logs/')
                }
                if (!fs.existsSync(path)) {
                    fs.writeFileSync(path, "");
                }
                let date_ob = new Date();
                let date = ("0" + date_ob.getDate()).slice(-2);

                let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();
                let hours = date_ob.getHours();
                let minutes = date_ob.getMinutes();
                let seconds = date_ob.getSeconds();

                let datetime = '[' + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + ']';
                let stringlog = datetime + ' ' + what

                if (type === 'log' && datatype !== '' && identifier !== '' && action !== '') {
                    await mongoose.connect(process.env.DB_CONNECTION, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        useFindAndModify: false,
                        useCreateIndex: true
                    });
                    const LogModel = mongoose.model('log', this.Log);
                    const log = new LogModel();
                    log.timestamp = new Date().getTime()
                    log.identifier = identifier
                    log.datatype = datatype
                    log.action = action
                    log.save()
                }
                fs.appendFileSync(path, stringlog + "\n");
            } catch (err) {
                console.error(err)
            }
        }
    }

}

export = Utilities;