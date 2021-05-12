const express=require('express');
const app=express();
const db=require('./model/db.js');
// id需要专门转化才可以,处理ObjectId数据
const ObjectId=require('mongodb').ObjectID;
app.use('/',express.static('./www/product'))
// 增加商品
app.use('/addProduct',(req,res)=>{
	let obj={
		title:req.query.title,
		price:parseInt(req.query.price),
		num:req.query.num
	}
	db.insert('product','maquillage',obj,(a)=>{
		res.send(a);
	})
})
//获取总页数
app.use('/getTotalPages',(req,res)=>{
	let obj={};
	db.find('product','maquillage',obj,(a)=>{
		// console.log(a)
		res.send(a);
	});
})
// 获取商品
app.use('/getProduct',(req,res)=>{
	let obj={};
	let skip = parseInt(req.query.skip);
	let limit = parseInt(req.query.limit);
	// console.log(req.query.sortPrice);
	let sort={price:parseInt(req.query.sortPrice)};
	db.find('product','maquillage',obj,(a)=>{
		// console.log(a)
		res.send(a);
	},sort,skip,limit);
})
//获取搜索商品总页数
app.use('/getSearchTotalPages',(req,res)=>{
	console.log(req.query.productPartName);
	let obj={title: { $regex: '.*' + req.query.productPartName + '.*' }};
	db.find('product','maquillage',obj,(a)=>{
		// console.log(a)
		res.send(a);
	});
})
// 搜索商品
app.use('/searchProduct',(req,res)=>{
	console.log(req.query.productPartName);
	let obj={title: { $regex: '.*' + req.query.productPartName + '.*' }};
	let skip = parseInt(req.query.skip);
	let limit = parseInt(req.query.limit);
	// console.log(req.query.sortPrice);
	let sort={price:parseInt(req.query.sortPrice)};
	db.find('product','maquillage',obj,(a)=>{
		// console.log(a)
		res.send(a);
	},sort,skip,limit);
})
// S升序
app.use('/up',(req,res)=>{
	let obj={};
	// console.log(req.query.sortPrice);
	let sort={price:parseInt(req.query.sortPrice)};
	let skip = parseInt(req.query.skip);
	let limit = parseInt(req.query.limit);
	db.find('product','maquillage',obj,(a)=>{
		// console.log(a)
		res.send(a);
	},sort,skip,limit);
})
app.use('/del',(req,res)=>{
	// console.log(req.query._id)
	let obj={
		_id:new ObjectId(req.query._id)
	};
	
	db.del('product','maquillage',obj,(a)=>{
		
		res.send(a);
	})
})

app.use('/edit',(req,res)=>{
	// console.log(req.query._id)
	let obj={
		_id:new ObjectId(req.query._id)
	};
	let updateobj={
		title:req.query.title,
		price:req.query.price,
		num:req.query.num
	}
	// let updateobj = {title: '口红'};
	
	db.update('product','maquillage',obj,updateobj,(a)=>{
		
		res.send(a);
	})
})
app.listen('8989')