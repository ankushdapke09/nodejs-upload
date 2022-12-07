const stream = require('stream');
const await = require('await')
const fs = require('fs');
const path = require('path');

const db = require('../config/db.config');
const User = db.User;

const csv = require('fast-csv');
const multer = require('multer');
const { nextTick } = require('process');
const Json2csvParser = require('json2csv').Parser;

/**
 * Upload Single CSV file/ and Import data to MySQL/PostgreSQL database
 * @param {*} req 
 * @param {*} res 
 */
exports.uploadFile = (req, res, next) => {
    try {
        if (!req.file.mimetype == "text/csv") {
            res.send("Invalid File");
        }
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        const users = [];
        fs.createReadStream(__basedir + "/file/" + req.file.filename)
            .pipe(csv.parse({ headers: true }))
            .on('error', error => {
                console.error(error);
                throw error.message;
            })
            .on('data', row => {
                users.push(row);
                console.log(row);
            })
            .on('end', () => {
                const uniqueUsers = [...new Set(users)]
                console.log('=======row===========',uniqueUsers);

                uniqueUsers.map((row) => {
                console.log('=======row===email========',row['Email ID']);
                    if (!row['Email ID'] === '') {
                        if (!validRegex.test(row.email)) {
                            res.json({ msg: 'Provide proper Emaild' })
                            next();
                        }
                    }
                })
                // Save users to MySQL/PostgreSQL database
                User.bulkCreate([...new Set(users)]).then(() => {
                    const result = {
                        status: "ok",
                        filename: req.file.originalname,
                        message: "Upload Successfully!",
                    }
                    res.json(result);
                });
            });
    } catch (error) {
        const result = {
            status: "fail",
            filename: req.file.originalname,
            message: "Upload Error! message = " + error.message
        }
        res.json(result);
    }
}

exports.downloadFile = (req, res) => {
    User.findAll({ attributes: ['id', 'name', 'email', 'phone'] }).then(objects => {
        const jsonusers = JSON.parse(JSON.stringify(objects));
        const csvFields = ['Id', 'Name', 'Email', 'Phone'];
        const json2csvParser = new Json2csvParser({ csvFields });
        const csvData = json2csvParser.parse(jsonusers);

        res.setHeader('Content-disposition', 'attachment; filename=users.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).end(csvData);
    });
}