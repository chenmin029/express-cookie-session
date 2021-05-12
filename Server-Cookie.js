const express = require('express');
const bodyparse = require('body-parser');
const db = require('./model/db.js');
const ObjectId=require('mongodb').ObjectID;
const cookieParser=require('cookie-parser');
const urlencoded = bodyparse.urlencoded({extended:false});
const app = express();
app.use(cookieParser());

app.use('/js',express.static('./www/js'));
app.use('/',express.static('./www/login'));
app.use('/register',express.static('./www/register'));
app.use('/updateuser',express.static('./www/update'));
app.use('/product',express.static('./www/product'));
//用户登录
app.post('/login',urlencoded,(req,res)=>{
	let result={};
	//1、非空验证用户名和密码
	let username = req.body.username;
	let password = req.body.password;
	if (username == "" || username == undefined){
		result = {Code:400,msg:'用户名不能为空！'};
		res.send(result);
		return;
	}
	if (username.length<6 || username.length > 14){
		result = {Code:400,msg:'用户名的长度不在6到14之间'};
		res.send(result);
		return;
	}
	var regex=/^\w+$/;
	let checkFormat = regex.test(username);
	if (checkFormat == false){
		result = {Code:400,msg:'用户名只能是数字、字母或者下划线组成'};
		res.send(result);
		return;
	}
	if (password == "" || password == undefined){
		result = {Code:400,msg:'密码不能为空！'};
		res.send(result);
		return;
	}
	//2、数据库验证是否存在用户名和密码
	let obj = {username:username,password:password};
	db.find('user','userinfo',obj,(result)=>{
		if (result.length > 0){
			//3、如果存在，验证正确，记录cookie,进入product
			res.cookie('username',username,{maxAge:8 * 3600 * 1000,httponly:true});
			result = {Code:200,msg:'登录成功！'};
			res.send(result);
			return;
		} else {
			//4、如果不存在，提示账号密码错误
			result = {Code:400,msg:'用户名或者密码错误！'};
			res.send(result);
			return;
		}
	})
	
})
//添加账号
app.post('/adduser',urlencoded,(req,res)=>{
	let username = req.body.username,name = req.body.name,password = req.body.password;
	let obj = {
		username:username,
		name:name,
		password:password
	};
	db.insert('user','userinfo',obj,(result)=>{
		res.send(result);
	})	
})
//退出登录
app.use('/logout',(req,res)=>{
	//1、验证cookie是否存在，如果不存在，返回没有登录，不需要退出登录
	let result = {};
	if(req.cookies.username){
		res.cookie('username','',{maxAge:1000,httponly:true});
		// result={Code:200,msg:'退出成功'}
	} 
	result={Code:200,msg:'退出成功'}
	res.send(result);
	//2、如果存在，将cookie中的登录信息设置为undefined
	//3、返回登录界面
})
//修改用户
app.post('/updateuser',urlencoded,(req,res)=>{
	let obj = {
		username:req.body.username,
		password:req.body.password
	}
	let newuser = {
		name:req.body.name,
		password:req.body.newpassword
	}
	db.find('user','userinfo',obj,(result)=>{
		if (result.length > 0){
			//修改用户
			db.update('user','userinfo',obj,newuser,(result)=>{
				if (result.result.n == 1){
					//清除cookie
					res.cookie('username','',{maxAge:1000,httponly:true});
					res.send({Code:200,msg:'用户修改成功'});
				}
			})
		} else {
			res.send({Code:400,msg:'用户不存在'})
		}
	})
})
//注销用户
app.use('/removeuser',(req,res)=>{
	let obj = {
		username:req.body.username
	}
	//1、验证数据库是否存在该用户，如果不存在，提示没有该用户，不需要注销
	//2、如果存在，删除用户
	//3、将cookie中的登录信息设置为''
	//3、返回登录界面
	db.find('user','userinfo',obj,(result)=>{
		if (result.length > 0){
			//修改用户
			db.del('user','userinfo',obj,(result)=>{
				if (result.result.n == 1){
					//清除cookie
					res.cookie('username','',{maxAge:1000,httponly:true});
					res.send({Code:200,msg:'注销用户成功'});
				}
			})
		} else {
			res.send({Code:400,msg:'用户不存在'})
		}
	})
})
//获取cookie的登录信息
app.use('/getlogin',(req,res)=>{
	//1、提取cookie的登录信息
	let result = {};
	if(req.cookies.username){
		result = {Code:'200',username:req.cookies.username};
	} else {
		result = {Code:'400',username:''};
	}
	res.send(result);
	//2、返回登录信息
})
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
	let sort={price:parseInt(req.query.sortPrice)};
	db.find('product','maquillage',obj,(a)=>{
		res.send(a);
	},sort,skip,limit);
})
//获取搜索商品总页数
app.use('/getSearchTotalPages',(req,res)=>{
	console.log(req.query.productPartName);
	let obj={title: { $regex: '.*' + req.query.productPartName + '.*' }};
	db.find('product','maquillage',obj,(a)=>{
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
		res.send(a);
	},sort,skip,limit);
})
//升序
app.use('/up',(req,res)=>{
	let obj={};
	// console.log(req.query.sortPrice);
	let sort={price:parseInt(req.query.sortPrice)};
	let skip = parseInt(req.query.skip);
	let limit = parseInt(req.query.limit);
	db.find('product','maquillage',obj,(a)=>{
		res.send(a);
	},sort,skip,limit);
})
//删除商品
app.use('/del',(req,res)=>{
	let obj={
		_id:new ObjectId(req.query._id)
	};
	
	db.del('product','maquillage',obj,(a)=>{		
		res.send(a);
	})
})
//编辑商品
app.use('/edit',(req,res)=>{
	let obj={
		_id:new ObjectId(req.query._id)
	};
	let updateobj={
		title:req.query.title,
		price:req.query.price,
		num:req.query.num
	}
	
	db.update('product','maquillage',obj,updateobj,(a)=>{
		res.send(a);
	})
})

app.listen('8989');

