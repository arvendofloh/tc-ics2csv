const program = require('commander');
const fs = require('fs');
const path = require('path');
const pkg = require(path.join(__dirname, 'package.json'));
const ical = require('ical');
const stringify = require('csv-stringify');

program
    .version(pkg.version)
    .usage('<folder> <fileExtension>')
    .parse(process.argv);

let data = [];
let columns = {
    land: 'Land',
    region: 'Region',
    art: 'Art',
    titel: 'Titel',
    start: 'Start',
    ende: 'Ende'
};

const walkSync = (currentDirPath, callback) => {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

if (program.args.length === 0) {
    program.help();
} else {
    const folder = program.args[0];
    const fileType = '.' + program.args[1];

    walkSync(folder, function(filePath) {
        if(path.extname(filePath).toLowerCase() === fileType){
            const calData = ical.parseFile(filePath);
            const pathInfo = filePath.split('/');
            for (const event of Object.values(calData)) {
                data.push([pathInfo[1], pathInfo[2], pathInfo[3], event.summary, event.start.toISOString(), event.end.toISOString()]);
            };
        }
    });
    stringify(data, { header: true, columns: columns }, (err, output) => {
        if (err) throw err;
        fs.writeFile('ics.csv', output, (err) => {
          if (err) throw err;
          console.log('ics.csv saved.');
        });
      });
}
