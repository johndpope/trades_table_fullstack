const express = require("express");
const router = express.Router();
const tradeLogic = require("../logic/trade-logic.js");
const CSVToJSON = require("csvtojson");
const fs = require("fs");
const data = require("../source.json");
let source = "sourceFile";
let unmatchedArray = [];

router.get("/sourcetojson", async (req, res, next) => {
  await CSVToJSON()
    .fromFile("../../seconed project/sql/baml_202101.csv")
    .then((result) => {
      fs.writeFile("source.json", JSON.stringify(result, null, 4), (err) => {
        if (err) {
          throw err;
        }
        console.log("JSON array is saved.");
      });

      // res.json(result)
    })
    .catch((err) => {
      // log error if any
      console.log(err);
    });
});

router.get("/createtable", async (req, res, next) => {
  const categories = Object.keys(data[0]);
  console.log(categories);
  try {
    const tableCreated = await tradeLogic.createTable(categories, source);
    res.json(tableCreated);
  } catch (err) {
    return err;
  }
});
router.get("/pushjson", async (req, res, next) => {
  try {
    const categories = (Object.keys(data[0]));
    const pushJson = await tradeLogic.pushJson(categories,data, source);
    res.json("push was completed");
  } catch (err) {
    return err;
  }
});

router.get("/nvsn", async (req, res, next) => {
  try {
    const resultDash = await tradeLogic.getNVsN(source);

    resultDash.leftTradesToFind.map((trade) => unmatchedArray.push(trade));
    // console.log(unmatchedArray);

    res.json(resultDash);
  } catch (err) {
    return err;
  }
});

router.get("/nvs1", async (req, res, next) => {
  source = "unmatched_NVsN";
  const categories = Object.keys(unmatchedArray[0]);
  try {
    const tableCreated = await tradeLogic.createTable(categories,source);
  } catch (err) {
    throw err;
  }
  try {
    const pushJson = await tradeLogic.pushJson(categories, unmatchedArray, source);
    res.json("push was completed");
  } catch (err) {
    throw err;
  }
  const resultNvs1=await tradeLogic.getNVs1(source)

  //   const data = JSON.parse(map1.get("array"))
  //   try{
  //
  //       const result = await tradeLogic.pushJson(data, source);
  //       res.json(result);
  //   }
  //   catch(err){throw err}
});

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

router.get("/1vs1", async (req, res, next) => {
  try {
    const resultDash = await tradeLogic.get1vs1();
    res.json(resultDash);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
