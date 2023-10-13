var xlsx = require('node-xlsx');
const { querySql } = require('../utils/index');

// 解析得到文档中的所有 sheet

var sheets = xlsx.parse('./files/Base_Information.xlsx');

// 遍历 sheet

sheets.forEach(function (sheet) {

    const sheetName = sheet['name'];
    console.log('---------------------------------', sheetName);

    if(sheetName === 'customer1') {
        // 读取每行内容
        let start = 0, gap = 200;
        const toInsertData = () => {
            let insertSql = `insert into customer VALUES`;
            const data = sheet['data'];
            const dataKeys = Object.keys(data).slice(1);
            dataKeys.slice(start, start + gap).forEach((rowId) => {
                if (!rowId) return;
                let sql = `(`
                var row = data[rowId];
                const [id, name] = row;
                sql += [id, name].map(v => {
                    if (typeof v === 'string') {
                        return `"${v}"`
                    };
                    return v ? v : -1;
                }).join(',')
                sql += '),';
                insertSql += sql;
            });

            querySql((insertSql).slice(0, -1)).then(() => {
                start += gap;
                toInsertData();
                console.log('---customer插入数据成功，起始位置' + start + '共插入' + gap + '条数据')
            })
        }
        toInsertData();
    }else if (sheetName === 'country1') {
        // 读取每行内容
        let insertSql = `insert into country VALUES`;
        const data = sheet['data'];
        const dataKeys = Object.keys(data).slice(1);
        dataKeys.forEach((rowId) => {
            if (!rowId) return;

            let sql = `(`
            var row = data[rowId];
            const [id, code, ename, cname, region] = row;
            // sql += `${id},${code},${ename},${cname},${region}`;
            sql += [id, code, ename, cname, region].map(v => {
                if (typeof v === 'string') {
                    return `"${v}"`
                };
                return v;
            }).join(',')
            sql += '),';
            insertSql += sql;
        });

        querySql((insertSql).slice(0, -1)).then(() => {
            console.log('---country插入数据成功，共插入' + dataKeys.length + "条数据")
        })

    } else if (sheetName === 'destination') {
        // 读取每行内容
        let start = 0, gap = 100;
        const toInsertData = () => {
            let insertSql = `insert into destination VALUES`;
            const data = sheet['data'];
            const dataKeys = Object.keys(data).slice(1);
            dataKeys.slice(start, start + gap).forEach((rowId) => {
                if (!rowId) return;
                let sql = `(`
                var row = data[rowId];
                const [id, name, code, country_id] = row;
                sql += [id, name, code, country_id].map(v => {
                    if (typeof v === 'string') {
                        return `"${v}"`
                    };
                    return v ? v : -1;
                }).join(',')
                sql += '),';
                insertSql += sql;
            });
            querySql((insertSql).slice(0, -1)).then(() => {
                start += gap;
                toInsertData();
                console.log('---destination插入数据成功，起始位置' + start + '共插入' + gap + '条数据')
            })
        }
        toInsertData();
    }


});