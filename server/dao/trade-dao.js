const res = require("express/lib/response");
const {
  VARCHAR,
  DATETIME,
  DECIMAL,
} = require("mysql/lib/protocol/constants/types");
const connection = require("./connection-wrapper");

async function createTable(categories, source) {
  try {
    let sql = `CREATE TABLE ${source} (
      id BIGINT NOT NULL AUTO_INCREMENT,
      ${categories.map((element) => {
        if (element !== "id") {
          const row = element.replaceAll(" ", "_").replaceAll("/", "_");
          return `${row} VARCHAR(100) `;
        }
      })}      
      ,PRIMARY KEY (id),
            UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE)
      `;

    sql = sql.replaceAll(",\n      ,", ",");
    const result = await connection.execute(sql);
    return result.insertId;
  } catch (err) {
    return err.code;
  }
}

async function pushJson(categories, data, source) {
  let sql = `INSERT INTO ${source} ( ${categories.map((element) => {
    const row = element.replaceAll(" ", "_").replaceAll("/", "_");
    return `${row}`;
  })}) VALUES (${categories.map((value) => {
    return `?`;
  })})`;
  let params = Object.values(data);
 
  try {
    const result = connection.executeWithParameters(sql, params);
    return;
  } catch (err) {
    throw err;
  }
}
async function addId(source) {
  let sql2 = `ALTER TABLE stocks_report.${source}
    ADD COLUMN id BIGINT NOT NULL AUTO_INCREMENT AFTER Ex_Firm,
    ADD PRIMARY KEY (id),
    ADD UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE;
    ;`;
  const result2 = await connection.execute(sql2);
}

async function get1vs1() {
  let sql = `SELECT * FROM stock_table2.baml_202101;`;
  let sql2 = `select b.id, b.actions,b.Trade_Date,b.option,b.Qty,b.Sym,b.Strike,b.Price,b.Total_Charges,
 b.Exch,b.P_C,b.B_S,b.Class,b.Sym,b.Mo,b.Yr,b.O_C,b.CFM,b.Ex_Brok,b.CMTA,b.Ex_Firm,
  d.floor_broker, d.date,d.side,d.component_type,d.contract_type,d.symbol,d.expiry,d.strike,d.optionn ,d.client_id

    from (select *,
    CASE WHEN b.B_S ="b" THEN 'buy'
    ELSE 'sell'
    END AS actions,
    case when b.P_C="p" Then "put"
    else "call"
    end as "option"
    FROM baml_202101 b) b
    inner join (SELECT *, STR_TO_DATE(date,'%m/%d/%Y') as dateFormat from drv_trade_client_account_execution_202101) d
    where d.side= b.actions and  b.Trade_Date= d.dateFormat and d.optionn=b.option and b.Qty = d.quantity and b.Sym=d.symbol  
    and DATE_FORMAT(STR_TO_DATE(concat(b.mo,"/",b.Yr),'%m/%Y'),"%Y/%m")=DATE_FORMAT(STR_TO_DATE(d.expiry,'%m/%d/%Y'), "%Y/%m")
    and b.Strike=d.strike and b.Price=d.price
     group by b.id 
    `;
  try {
    let allTrades = await connection.execute(sql);
    let trades1Vs1 = await connection.execute(sql2);
    return { allTrades, trades1Vs1 };
  } catch (err) {
    throw err;
  }
}
async function getNVs1() {
  let sql = `SELECT * FROM stock_table2.left_trades_after_reduce_1vs1`;
  let sql2 = `select *
    from (select *,sum(Qty) as sumQ, sum(Qty*Price)/sum(Qty) as avg,sum(Total_Charges) as sumTotalCharge,
    CASE WHEN b.B_S ="b" THEN 'buy'
    ELSE 'sell'
    END AS actions,
    case when b.P_C="p" Then "put"
    else "call"
    end as "option"
    FROM baml_202101 b
    group by b.Trade_Date ,b.Exch,b.P_C,b.B_S,b.Class,b.Sym,b.Mo,b.Yr,b.Strike,b.O_C,b.CFM,b.Ex_Brok,b.CMTA,b.Ex_Firm) b
    inner join (SELECT *, STR_TO_DATE(date,'%m/%d/%Y') as dateFormat from drv_trade_client_account_execution_202101) d
    where d.side= b.actions and  b.Trade_Date= d.dateFormat and d.optionn=b.option and b.sumQ = d.quantity and b.Sym=d.symbol  
    and DATE_FORMAT(STR_TO_DATE(concat(b.mo,"/",b.Yr),'%m/%Y'),"%Y/%m")=DATE_FORMAT(STR_TO_DATE(d.expiry,'%m/%d/%Y'), "%Y/%m")
    and b.Strike=d.strike and b.avg=d.price
    group by b.id`;
  try {
    let allTrades = await connection.execute(sql);
    let tradesNVs1 = await connection.execute(sql2);
    return { allTrades, tradesNVs1 };
  } catch (err) {
    throw err;
  }
}
async function getNVsN(source) {
  let sql = `SELECT * FROM ${source};`;
  let sql2 = `select 
  * ,b.id as idSource
  from (select *, 
  CASE WHEN b.B_S ="b" THEN 'buy'
  ELSE 'sell'
  END AS actions,
  case when b.P_C="p" Then "put"
  else "call"
  end as "option"
  FROM ${source} b
  group by b.Trade_Date ,b.Exch,b.P_C,b.B_S,b.Class,b.Sym,b.Mo,b.Yr,b.Strike,b.O_C,b.CFM,b.Ex_Brok,b.CMTA,b.Ex_Firm) b
  inner join (SELECT *, STR_TO_DATE(date,'%m/%d/%Y') as dateFormat from drv_trade_client_account_execution_202101 d
  group by d.floor_broker, d.date,d.side,d.component_type,d.contract_type,d.symbol,d.expiry,d.strike,d.option ,d.client_id ) d
  on  DATE_FORMAT(STR_TO_DATE(b.trade_date,'%m/%d/%Y') ,"%m/%d/%Y") = DATE_FORMAT(STR_TO_DATE(d.date,'%m/%d/%Y'),"%m/%d/%Y" )
  and d.side= b.actions
  and d.option=b.option 
  and CAST(b.Qty AS UNSIGNED)=CAST(d.quantity AS UNSIGNED) 
  and b.Sym=d.symbol 
  and DATE_FORMAT(STR_TO_DATE(concat(b.mo,"/",b.Yr),'%m/%Y'),"%Y/%m")=DATE_FORMAT(STR_TO_DATE(d.expiry,'%m/%d/%Y'), "%Y/%m")
  and CAST(b.Strike AS DECIMAL(10,3)) = CAST(d.strike AS DECIMAL(10,2))
  and CAST(b.Price AS DECIMAL(10,3)) = CAST(d.price AS DECIMAL(10,3))
  group by b.id 
  `;
  try {
    let allTrades = await connection.execute(sql);
    let tradesNVsN = await connection.execute(sql2);
    return { allTrades, tradesNVsN };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  get1vs1,
  getNVs1,
  getNVsN,
  createTable,
  pushJson,
  addId,
};
