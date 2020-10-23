const { json } = require("body-parser");
var express = require("express");
var router = express.Router();
const TableStore = require("tablestore");

const client = require("../utils/client");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//!添加文章
router.post("/add", (req, res) => {
  const {
    articleTitle,
    articleContent,
    articleMarkedContent,
    articleDesc,
    articleImgUrl,
    date,
  } = req.body;

  const params = {
    tableName: "master_article",
    condition: new TableStore.Condition(
      TableStore.RowExistenceExpectation.IGNORE,
      null
    ),
    primaryKey: [
      // { id: `${Date.now()}-${Math.random()}` }
      { id: `${Date.now() - Math.random()}` },
    ],
    attributeColumns: [
      { articleTitle },
      { articleContent },
      { articleMarkedContent },
      { articleDesc },
      { articleImgUrl },
      { date },
    ],
  };

  client.putRow(params, function (err, data) {
    if (err) {
      console.log("error:", err);
      res.json({ error: err });
      return;
    }

    console.log("success:", data);
    res.json("add");
  });
});

//!删除文章
router.post("/delete", (req, res) => {
  let {id} = req.body
  const params = {
    tableName: "master_article",
    condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
    primaryKey: [{ id }]
};

client.deleteRow(params, function (err, data) {
  if (err) {
    console.log("error:", err);
    return;
  }
  res.json("delete");
  console.log("success:", data);
});

});

//!获取单个文章
router.get("/getone", (req, res) => {
  console.log(req.query);

  let { id } = req.query;

  var params = {
    tableName: "master_article",
    primaryKey: [{ id }],
  };
  client.getRow(params, function (err, data) {
    if (err) {
      console.log("error:", err);
      res.json({ error: err });
      return;
    }
    console.log("success:", data);
    let data2 = {
      data: data.row,
    };
    res.json(data2);
  });
});

//!修改文章

router.post("/update", (req, res) => {
  console.log(req.body);

  const {
    id,
    articleTitle,
    articleContent,
    articleMarkedContent,
    articleDesc,
    articleImgUrl,
    date,
  } = req.body;

  const params = {
    tableName: "master_article",
    condition: new TableStore.Condition(
      TableStore.RowExistenceExpectation.IGNORE,
      null
    ),
    primaryKey: [{ id }],
    updateOfAttributeColumns: [
      {
        PUT: [
          { articleTitle },
          { articleContent },
          { articleMarkedContent },
          { articleDesc },
          { articleImgUrl },
          { date },
        ],
      },
    ],
  };

  client.updateRow(params, function (err, data) {
    if (err) {
      console.log("error:", err);
      res.json({ error: err });
      return;
    }

    console.log("success:", data);
  });

  res.json("update");
});

//!获取所有文章
router.get("/getall", (req, res) => {
  const params = {
    tableName: "master_article",
    direction: TableStore.Direction.FORWARD,
    inclusiveStartPrimaryKey: [{ id: TableStore.INF_MIN }],
    exclusiveEndPrimaryKey: [{ id: TableStore.INF_MAX }],
    limit: 100,
  };

  client.getRange(params, function (err, data) {
    if (err) {
      console.log("error:", err);
      res.json({ error: err });
      return;
    }
    // console.log("success:", data);
    // console.log("success:", ...data.rows);
    res.json(data);
  });
});

//!查询文章
router.get("/search", (req, res) => {
  let { content } = req.query;
  console.log(content);
  let params = {
    tableName: "master_article",
    // indexName: INDEX_NAME,
    searchQuery: {
      offset: 0,
      limit: 100, //如果只为了获取行数，无需获取具体数据，可以设置limit=0，即不返回任意一行数据。
      query: {
        //设置查询类型为TableStore.QueryType.PREFIX_QUERY。
        queryType: TableStore.QueryType.PREFIX_QUERY,
        query: {
          fieldName: "articleTitle",
          prefix: content, //设置前缀值，可匹配到"hangzhou"、"hangzhoushi"等。
        },
      },
      getTotalCount: true, //结果中的TotalCount可以表示表中数据的总行数，默认为false，表示不返回。
    },
    columnToGet: {
      //返回列设置RETURN_SPECIFIED（自定义）、RETURN_ALL（所有列）和RETURN_NONE（不返回）。
      returnType: TableStore.ColumnReturnType.RETURN_ALL,
    },
  };
  client.search(params, function (err, data) {
    if (err) {
      console.log("error:", err);
      return;
    }
    console.log("success:", JSON.stringify(data, null, 2));
    res.json("search");
  });
});
module.exports = router;
