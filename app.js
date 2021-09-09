const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const nanoid = require("nanoid");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://" + process.env.DBUSER + ":" + process.env.DBPASS + "@" + process.env.DBURI + "/" + process.env.DBNAME + process.env.DBOPTIONS, {useNewUrlParser: true});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your new list"
});
const item2 = new Item ({
  name: "hit the ➕ button to add a new item"
});
const item3 = new Item ({
  name: "👈 checkbox deletes item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/favicon.ico', function(req, res) {
    res.status(204);
    res.end();
});

app.get('/robots.txt', function(req, res) {
    res.status(204);
    res.end();
});

app.get("/", function(req, res) {

  let uuid = nanoid.nanoid(10);
  res.redirect("/" + uuid);

  // Item.find({}, function(err, foundItems){
  //   if (err) {
  //     console.log(err);
  //   } else {
  //
  //     if (foundItems.length === 0) {
  //       Item.insertMany(defaultItems, function(err) {
  //         if (err) {
  //           console.log(err);
  //         } else {
  //           console.log("Empty list. Saved default items to database...");
  //           res.redirect("/");
  //         }
  //       });
  //     } else {
  //     // console.log(foundItems);
  //     res.render('list', {listTitle: "Main List", newListItems: foundItems});
  //     }
  //   }
  // });
});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, results) {
    if (!err) {
      if(!results) {
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: customListName, newListItems: results.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Main") {
    console.log("added " + itemName + " to main list");
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

    console.log("You added " + itemName + " to the " + listName + " DB.");
  }

});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  console.log("Deleting ID " + checkedItemID + " from " + listName + " DB.");
  List.findOneAndUpdate(
    {name: listName},
    {$pull: {items: {_id: checkedItemID}}},
    function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });

// Item.findByIdAndRemove(checkedItemID, function(err){
//   if(err){
//     console.log(err);
//   } else {
//     console.log("Removed " + checkedItemID + " successfully.");
//   }
// });
//
// res.redirect("/");
})

// app.get("/work", function(req, res) {
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.post("/work", function(req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000.");
});
