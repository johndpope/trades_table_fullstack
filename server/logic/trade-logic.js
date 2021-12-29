const tradesDao = require("../dao/trade-dao.js");
const fs = require("fs");
const res = require("express/lib/response");

async function createTable(categories,source) {
  try {
    const result = await tradesDao.createTable(categories,source);
    return result;
  } catch (err) {
    throw err;
  }
}
async function pushJson(categories, data, source) {
  const result = await data.map((trade) => {
    tradesDao.pushJson(categories,trade, source);
  });
  // await tradesDao.addId(source);
  return 
}



async function getNVsN(source) {
  const leftTradesToFind = [];
  try {
    const result = await tradesDao.getNVsN(source);
    result.allTrades.map((trade) => {
      if (
        !result.tradesNVsN.find(
          (tradeToRemove) => tradeToRemove.idSource == trade.id,
        )
      ) {
        leftTradesToFind.push(trade);
      }
    });
    return {
      fileName: source,
      totalOfTrade: result.allTrades.length,
      totalCharges: sumTotalCharges(result.allTrades),
      matchingFound: result.tradesNVsN.length,
      matchingFoundTotalCharges: sumTotalCharges(result.tradesNVsN),
      unmatchedLeft: leftTradesToFind.length,
      leftTradesToFind
    };
  } catch (err) {
    throw err;
  }
}



async function getNVs1(source) {
  const leftTradesToFind = [];
  try {
    const result = await tradesDao.getNVs1(source);
    result.allTrades.map((trade) => {
      if (
        !result.tradesNVsN.find(
          (tradeToRemove) => tradeToRemove.idSource == trade.id,
        )
      ) {
        leftTradesToFind.push(trade);
      }
    });
    return {
      fileName: source,
      totalOfTrade: result.allTrades.length,
      totalCharges: sumTotalCharges(result.allTrades),
      matchingFound: result.tradesNVsN.length,
      matchingFoundTotalCharges: sumTotalCharges(result.tradesNVsN),
      unmatchedLeft: leftTradesToFind.length,
      leftTradesToFind
    };
  } catch (err) {
    throw err;
  } 
}





const sumTotalCharges = (arrayList) => {
  try {
    let total = 0,
      tradeTotal;
    arrayList.map((trade) => {
      if (!isNaN(trade.Total_Charges)) {
        total += +trade.Total_Charges;
      } else if (
        trade.Total_Charges.includes("(") &&
        trade.Total_Charges.includes(")")
      ) {
        if (trade.Total_Charges.includes(",")) {
          tradeTotal = trade.Total_Charges.replaceAll(",", "");
        }
        tradeTotal = trade.Total_Charges.substring(
          1,
          trade.Total_Charges.length - 1,
        );
        total += -1 * +tradeTotal;
      } else if (trade.Total_Charges.includes(",")) {
        const tradeCharges = trade.Total_Charges.replaceAll(",", "");
        total += +tradeCharges;
      }
    });
    return total;
  } catch (err) {
    throw err;
  }
};
async function get1vs1() {
  const leftTradesToFind = [];
  let total = 0,
    tradeTotal;
  const result = await tradesDao.get1vs1();
  result.allTrades.map((trade) => {
    if (!isNaN(trade.Total_Charges)) {
      total += +trade.Total_Charges;
    } else if (
      trade.Total_Charges.includes("(") &&
      trade.Total_Charges.includes(")")
    ) {
      if (trade.Total_Charges.includes(",")) {
        tradeTotal = trade.Total_Charges.replaceAll(",", "");
      }
      tradeTotal = trade.Total_Charges.substring(
        1,
        trade.Total_Charges.length - 1,
      );
      total += -1 * +tradeTotal;
    } else if (trade.Total_Charges.includes(",")) {
      const tradeCharges = trade.Total_Charges.replaceAll(",", "");
      total += +tradeCharges;
    }
    ///////////////////////////////////////////
    // if(trade.Total_Charges[0]==="(" && trade.Total_Charges[trade.Total_Charges.length-1]===")"){
    //     trade.Total_Charges=trade.Total_Charges.replace(/[{()}]/g, '')
    //     trade.Total_Charges=parseInt(trade.Total_Charges,10)*-1
    //    }
    //    else{
    //     trade.Total_Charges=parseInt(trade.Total_Charges,10)
    //    }
    if (
      !result.trades1Vs1.find((tradeToRemove) => tradeToRemove.id == trade.id)
    ) {
      leftTradesToFind.push(trade);
    }
  });
  let totalChargesSource = 0;
  result.allTrades.map((array) => {
    totalChargesSource = totalChargesSource + array.Total_Charges;
  });
  let totalCharges1vs1 = 0,
    tradeTotal1vs1;
  leftTradesToFind.map((array) => {
    if (!isNaN(array.Total_Charges)) {
      totalCharges1vs1 += +array.Total_Charges;
    } else if (
      array.Total_Charges.includes("(") &&
      array.Total_Charges.includes(")")
    ) {
      if (array.Total_Charges.includes(",")) {
        tradeTotal1vs1 = array.Total_Charges.replaceAll(",", "");
      }
      tradeTotal1vs1 = array.Total_Charges.substring(
        1,
        array.Total_Charges.length - 1,
      );
      totalChargesSource += -1 * +tradeTotal1vs1;
    } else if (array.Total_Charges.includes(",")) {
      const tradeCharges = array.Total_Charges.replaceAll(",", "");
      totalChargesSource += +tradeCharges;
    }
  });
  const jsonContent = JSON.stringify(leftTradesToFind);
  fs.writeFile(
    "./leftTradeAfterReducted1VS1.json",
    jsonContent,
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    },
  );

  return {
    sourceTrades: result.allTrades.length,
    sourceTotalCharges: total,
    tradesFound1Vs1: result.trades1Vs1.length,
    leftTradesToFind: leftTradesToFind.length,
    totalCharges1vs1: totalCharges1vs1,
  };
}

module.exports = {
  sumTotalCharges,
  createTable,
  pushJson,
  get1vs1,
  getNVsN,
  getNVs1,
};
