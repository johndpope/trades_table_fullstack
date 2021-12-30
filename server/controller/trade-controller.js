const express = require("express");
const router = express.Router();
const tradeLogic = require("../logic/trade-logic.js");
const CSVToJSON = require("csvtojson");
const fs = require("fs");
const data = require("../source.json");
let source = "sourceFile";
let unmatchedArray = [];
const nameList = ["source", "unmatched_NVsN", "unmatched_NVs1"];

router.get("/sourcetojson", async (req, res, next) => {
  await CSVToJSON()
    .fromFile("./../../third project/db/january 2021/baml_202101.csv")
    .then((result) => {
      fs.writeFile("source.json", JSON.stringify(result, null, 4), (err) => {
        if (err) {
          throw err;
        }
        console.log("JSON array is saved.");
      });

      res.json(result);
    })
    .catch((err) => {
      // log error if any
      console.log(err);
    });
  // console.log(results);
});

router.get("/createtable", async (req, res, next) => {
  const categories = Object.keys(data[0]);
  try {
    const tableCreated = await tradeLogic.createTable(categories, source);
    res.json(tableCreated);
  } catch (err) {
    return err;
  }
});

router.get("/pushjson", async (req, res, next) => {
  try {
    const categories = Object.keys(data[0]);
    const pushJson = await tradeLogic.pushJson(categories, data, source);
    res.json("push was completed");
  } catch (err) {
    return err;
  }
});

router.get("/nvsn", async (req, res, next) => {
  try {
    const resultDash = await tradeLogic.getNVsN(source);
    resultDash.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    res.json(resultDash);
  } catch (err) {
    return err;
  }
});
router.get("/nvs1", async (req, res, next) => {
  source = "unmatched_NVsN";
  const categories = Object.keys(unmatchedArray[0]);
  try {
    const tableCreated = await tradeLogic.createTable(categories, source);
    // const pushJson = await tradeLogic.pushJson(categories, unmatchedArray, source);
    // const resultDash = await tradeLogic.getNVs1(source);
    // resultDash.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    // res.json(resultDash);
    // res.json(tableCreated)
  } catch (err) {
    throw err;
  }
  try {
    const pushJson = await tradeLogic.pushJson(
      categories,
      unmatchedArray,
      source,
    );
    // res.json("push was completed");
  } catch (err) {
    throw err;
  }
  const resultNvs1 = await tradeLogic.getNVs1(source);
  unmatchedArray = [];
  resultNvs1.leftTradesToFind.map((trade) => unmatchedArray.push(trade));

  res.json(resultNvs1);
  //   const data = JSON.parse(map1.get("array"))
  //   try{
  //
  //       const result = await tradeLogic.pushJson(data, source);
  //       res.json(result);
  //   }
  //   catch(err){throw err}
});

router.get("/1vs1", async (req, res, next) => {
  source = "unmatched_nVs1";
  const categories = Object.keys(unmatchedArray[0]);
  try {
    const tableCreated = await tradeLogic.createTable(categories, source);
  } catch (err) {
    throw err;
  }
  try {
    const pushJson = await tradeLogic.pushJson(
      categories,
      unmatchedArray,
      source,
    );
  } catch (err) {
    throw err;
  }
  const result1vs1 = await tradeLogic.get1Vs1(source);
  unmatchedArray = [];
  result1vs1.leftTradesToFind.map((trade) => unmatchedArray.push(trade));

  res.json(result1vs1);
});

router.get("/getstats", async (req, res) => {
  //   await CSVToJSON()
  //     .fromFile("../../seconed project/sql/baml_202101.csv")
  //     .then((result) => {
  //       fs.writeFile(
  //         `${nameList[0]}.json`,
  //         JSON.stringify(result, null, 4),
  //         (err) => {
  //           if (err) {
  //             throw err;
  //           }
  //           console.log("JSON array is saved.");
  //         },
  //       );

  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });

  const categories = Object.keys(data[0]);

  //   nameList.forEach(async (name, index) => {
  //     console.log(index);
  let sourceName = nameList[0];
  try {
    await tradeLogic.createTable(categories, sourceName);
    await tradeLogic.pushJson(categories, data, sourceName);
    const result1 = await tradeLogic.getNVsN(sourceName);
    result1.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    ////////////////////////////////
    sourceName = nameList[1];
    await tradeLogic.createTable(categories, sourceName);
    await tradeLogic.pushJson(categories, unmatchedArray, sourceName);
    // const result2 = await tradeLogic.getNVs1(sourceName);
    // unmatchedArray = [];
    // result2.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    /////////////////
    // sourceName = nameList[2];
    // await tradeLogic.createTable(categories, sourceName);
    // await tradeLogic.pushJson(categories, unmatchedArray, sourceName);
    // const result3 = await tradeLogic.get1Vs1(sourceName);
    // unmatchedArray = [];
    // result2.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    // res.json(result2);
  } catch (err) {
    return err;
  }
  try {
  } catch (err) {
    return err;
  }
  try {
    //     let query
    //   switch (index) {
    //     case 0:
    //       query = await tradeLogic.getNVsN(sourceName);
    //       break;
    //     case 1:
    //       query = await tradeLogic.getNVs1(sourceName);
    //     case 2:
    //       query = await tradeLogic.get1Vs1(sourceName);
    //       break;
    //     default:
    //   }
    //   query.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    //   console.log(query.leftTradesToFind.length)
  } catch (err) {
    return err;
  }
});
// });

// router.get("/jsontosql", async (req, res, next) => {
//   let total = 0,
//     tradeTotal;
//   try {
//     data.map((trade) => {
//       //    console.log(trade)
//       if (!isNaN(trade["Total Charges"])) {
//         total += +trade["Total Charges"];
//       } else if (
//         trade["Total Charges"].includes("(") &&
//         trade["Total Charges"].includes(")")
//       ) {
//         if (trade["Total Charges"].includes(",")) {
//           tradeTotal = trade["Total Charges"].replaceAll(",", "");
//         }
//         tradeTotal = trade["Total Charges"].substring(
//           1,
//           trade["Total Charges"].length - 1,
//         );
//         total += -1 * +tradeTotal;
//       } else if (trade["Total Charges"].includes(",")) {
//         const tradeCharges = trade["Total Charges"].replaceAll(",", "");
//         total += +tradeCharges;
//       }
//       });
// const tableCreate = tradeLogic.createTable()

//   }
//   catch (err) {
//     throw err;
//   }
// });

module.exports = router;
