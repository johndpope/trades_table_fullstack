const tradesDao = require("../dao/trade-dao.js");
const fs = require("fs");
const res = require("express/lib/response");
const { parse } = require("path");

async function createTable(categories, source) {
  try {
    const result = await tradesDao.createTable(categories, source);
    return result;
  } catch (err) {
    throw err;
  }
}
async function pushJson(categories, data, source) {
  // console.log(categories, data[10], source);
  const result = await data.map((trade) => {
    tradesDao.pushJson(categories, trade, source);
  });
  // await tradesDao.addId(source);
  return;
}

async function getNVsN(source) {
  const leftTradesToFind = [];
  try {
    const result = await tradesDao.getNVsN(source);
    const idList = [];
    result.tradesNVsN.map((res) => {
      res.idGroupList.split(",").map((item, index) => {
        const number = parseInt(item, 10);
        if (isNaN(number)) {
          console.log(number);
        } else {
          idList.push(number);
        }
      });
    });
    result.allTrades.map((trade, index) => {
      if (!idList.find((tradeToRemove) => tradeToRemove == trade.id)) {
        leftTradesToFind.push(trade);
      }
    });
    return {
      fileName: `${source}`,
      numberOFFileTrades: result.allTrades.length,
      totalCharges: sumTotalCharges(result.allTrades),
      matchingFound: idList.length,
      matchingFoundTotalCharges: sumTotalCharges(result.tradesNVsN),
      unmatchedLeft: leftTradesToFind.length,
      leftTradesToFind,
    };
  } catch (err) {
    throw err;
  }
}

async function getNVs1(source) {
  const leftTradesToFind = [];
  try {
    const result = await tradesDao.getNVs1(source);
    const idList = [];
    result.tradesNVs1.map((res) => {
      res.idGroupList.split(",").map((item, index) => {
        const number = parseInt(item, 10);
        if (isNaN(number)) {
          console.log(number);
        } else {
          idList.push(number);
        }
      });
    });
    result.allTrades.map((trade, index) => {
      if (!idList.find((tradeToRemove) => tradeToRemove == trade.id)) {
        leftTradesToFind.push(trade);
      }
    });
    return {
      fileName: `${source}`,
      numberOFFileTrades: result.allTrades.length,
      totalCharges: sumTotalCharges(result.allTrades),
      matchingFound: idList.length,
      matchingFoundTotalCharges: sumTotalCharges(result.tradesNVs1),
      unmatchedLeft: leftTradesToFind.length,
      leftTradesToFind,
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
async function get1Vs1(source) {
  const leftTradesToFind = [];
  try {
    const result = await tradesDao.get1Vs1(source);
    result.allTrades.map((trade) => {
      if (
        !result.trades1Vs1.find(
          (tradeToRemove) => tradeToRemove.idSource == trade.id,
        )
      ) {
        leftTradesToFind.push(trade);
      }
    });
    return {
      fileName: source,
      numberOFFileTrades: result.allTrades.length,
      totalCharges: sumTotalCharges(result.allTrades),
      matchingFound: result.trades1Vs1.length,
      matchingFoundTotalCharges: sumTotalCharges(result.trades1Vs1),
      unmatchedLeft: leftTradesToFind.length,
      leftTradesToFind,
      // array: result.trades1Vs1,
    };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  sumTotalCharges,
  createTable,
  pushJson,
  get1Vs1,
  getNVsN,
  getNVs1,
};
