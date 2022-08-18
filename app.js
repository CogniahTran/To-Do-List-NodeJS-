//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Nt:ngoclong123@cluster0.qp8hyxe.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your toDoList!!!!!!"
});

const item2 = new Item({
  name: "Input and click + to add an new item"
});

const item3 = new Item({
  name: "<---- click this checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, itemsFound){
    if(itemsFound.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(!err){
          console.log("successfully insert data!");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: itemsFound});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList) { 
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("successfully deleted data!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListLink", function(req, res){
  const customListLink = req.params.customListLink;

  List.findOne({name: customListLink}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create an new custom list
        const list = new List({
          name: customListLink,
          items: defaultItems
        })
        
        list.save();
        res.redirect("/" + customListLink);
      }else{
        // show the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
