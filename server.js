require('dotenv').config();

const express = require('express'),
	app = express(),
	MongoClient = require('mongodb').MongoClient,
	ejs = require('ejs'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	sgMail = require('@sendgrid/mail');

//var url = "mongodb://" + process.env.HOST + ":" + process.env.PUERTO;
var url = process.env.MONGO_URL;

const client = new MongoClient(url);

app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.disable('view cache');

app.listen((process.env.PORT || 3000), function() {
	console.log('Puerto: ', (process.env.PORT || 3000));
})

app.use(cookieParser());

function randomLetters(size) {
	charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
	var randomString = '';
	for(var i = 0; i < size; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;
}

function randomID(size) {
	/*charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
	var randomString = '';
	for(var i = 0; i < size; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;*/
	var uuid = "", i, random;
	  for (i = 0; i < 32; i++) {
	    random = Math.random() * 16 | 0;

	    if (i == 8 || i == 12 || i == 16 || i == 20) {
	      uuid += "-"
	    }
	    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
	  }
	  return uuid;
}



// INICIAR DB
client.connect(function(err, client) {
	//console.log(process.env.SENDGRID_API)
	sgMail.setApiKey(process.env.SENDGRID_API)
	/*const confirmarCorreo = {
		to: "eduardokanp@gmail.com",
		from: "yo@vcano5.com",
		templateId: "d-617ba7f19dab427ca4d0ce249724dd5b",
		dynamicTemplateData: {
			url: 'mail.google.com/mail/u/0/#inbox'
		}
	}
	sgMail.send(msg)
	*/
	if(err) throw err
	console.log("Conectado correctamente al servidor");
	const db = client.db('datos'); 


	function buscarUsuarios(clave, valor, callback) {
		var x = db.collection('usuarios');
		if(clave == "matricula") {
			x.find({matricula: valor}).toArray(function(err, r) {
				if(err) throw err;
				return callback(r)
			})
		}
		if(clave == "fb_id") {
			x.find({fb_id: valor}).toArray(function(err, r) {
				if(err) throw err;
				return callback(r)
			})
		}
		/*db.collection('usuarios').find({clave: valor}).toArray(function(err, resu) {
			if(err) throw err; 
			console.log('Encontre ', resu);
			return callback(resu)
		})*/
	}

	function buscarNahuatl(query, valor, callback) {
		var x = db.collection('nahuatl');
		if(query == "espanol") {
			x.find({espanol: valor}).toArray(function(err, r) {
				if(err) throw err;
				return callback(r);
			})
		}
		if(query == "nahuatl") {
			x.find({nahuatl: valor}).toArray(function(err, r) {
				if(err) throw err;
				return callback(r);
			})
		}
		if(query == "clave") {
			x.find({clave: valor}).toArray(function(err, r) {
				if(err) throw err;
				//console.log(r)
				return callback(r);
			})
		}
		if(query == "matricula") {
			x.find({matricula: valor}).toArray(function(err, r) {
				if(err) throw err;

				return callback(r);
			})
		}
		if(query == "frase") {
			x.find({frase: valor}).toArray(function(err, r) {
				if(err) throw err;
				return callback(r);
			})
		}
	}

	function buscarTodos(coleccion, callback) {
		db.collection(coleccion).find({clave: valor})
			.toArray(function(err, resu) {
				if(err) throw err;
				//console.log('Encontre ', resu)
				return callback(resu);
			})
	}

	function insertarUsuarios(jotason, callback) {
		db.collection('usuarios').insertOne(jotason, function(err, r) {
			if(err) throw err;
			if(r.insertedCount > 0) {
				return callback(true);
			}
			else {
				return callback(false)
			}
		})
	}

	function insertarNahuatl(jotason, callback) {
		db.collection('nahuatl').insertOne(jotason, function(err, r) {
			if(err) throw err;
			if(r.insertedCount > 0) {
				return callback(true);
			}
			else {
				return callback(false);
			}
		})
	}

	function deleteNahuatl(clave, valor, callback) {
		var x = db.collection('nahuatl');
		if(clave == "clave") {
			x.deleteOne({clave: valor}, function(err, r) {
				if(err) throw err;
				return callback(true)
			})
		}
	}

	function actualizarUsuario(donde, es, jotason, callback) {
		var x = db.collection('usuarios');
		if(donde == "matricula") {
			x.updateOne({'matricula': es}, {$set: jotason}, function(err, r) {
				if(err) throw err;
				return callback(r.matchedCount);
			})
		}
		if(donde == "fb_id") {
			x.updateOne({fb_id: es}, {$set: jotason}, function(err, r) {
				if(err) throw err;
				return callback(r.matchedCount)
			})
		}

		/*db.collection(coleccion).updateOne({donde: es}, {$set: {clave: valor}}, function(err, r) {
			if(err) throw err;
			return callback(r.matchedCount)
		})*/
	}

	function actualizarNahuatl(donde, es, jotason, callback) {
		var x = db.collection('nahuatl');
		if(donde == "clave") {
			x.updateOne({clave: es}, {$set: jotason}, function(err, r) {
				if(err) throw err;
				return callback(r.matchedCount);
			})
		}
	}

 
	function cargarR(dominio) {
		if(dominio == "nahuatl") {
			return {fondo: "343a40", marca: "NAHUATL", logo: "https://"}
		}
	}

	function puedeModificar(req, clave, callback) {
		if(req.cookies.matricula !== undefined) {
			buscarNahuatl('clave', clave, function(res) {
				buscarUsuarios('matricula', req.cookies.matricula, function(r) {
					if(r[0].esAdmin == 1) {
						return callback(true);
					}
					else {
						if(req.cookies.matricula == res[0].matricula) {
							return callback(true);
						}
						else {
							return callback(false);
						}
					}
				})
			})
		}
		else {
			return callback(false)
		}
	}

	app.get('/', function(req, res) {
		res.cookie('posts', (req.cookies.posts || 50))
		//res.cookie('direccion', req.headers.host);
		res.render('pages/index', {direccion: req.cookies.direccion});
	})

	app.get('/estadisticas', function(req, res) {
		res.render('pages/estadisticas');
	})

	function sendFooter(req, respuesta) {
		if(req.query.pagina == undefined) {
			req.query.pagina = 0;
		}
		if(req.cookies.posts == undefined) {
			req.cookies.posts = 50
		}
		var r = []
		var inicial = (req.query.pagina * req.cookies.posts)
		r[0] = inicial - 20;
		r[1] = inicial - 10;
		r[2] = parseInt(inicial);
		r[3] = inicial + 10;
		r[4] = inicial + 20;
		return respuesta(r)
	}

	app.get('/configuracion', function(req, res) {
		res.render('pages/configuracion', {matricula: (req.cookies.matricula || "Anónimo"), posts: (req.cookies.posts || 10), texto: (req.query.texto || "")})
	})

	app.post('/configuracion', function(req, res) {
		if(req.body.posts !== undefined) {
			res.cookie('posts', req.body.posts)
			res.redirect('/configuracion?texto=Configuración%20actualizada%20correctamente')
		}
	})

	app.get('/busqueda', function(req, res) {
		if(req.query.n != undefined) {
			if(req.query.n == 'SALIR') {
				res.redirect('/logout')
			}
			else {
				var resultados = [];
				var rg = new RegExp(req.query.n, "gi");
				buscarNahuatl('nahuatl', rg, function(r) {
					buscarNahuatl('espanol', rg, function(rr) {
						buscarNahuatl('frase', rg, function(rrr) {
							for(var i = 0; i < r.length; i++) {
								resultados[resultados.length] = r[i]
							}
							for(var j = 0; j < rr.length; j++) {
								resultados[resultados.length] = rr[j]		
							}
							for(var k = 0; k < rrr.length; k++) {
								resultados[resultados.length] = rrr[k]		
							}
							//console.log("resultados: ", resultados.length)
							if(resultados.length == 1) {
								res.redirect('/clave?c=' + resultados[0].clave);
							}
							else if(resultados.length > 1) {
								var totales = (1 +Math.floor((resultados.length/req.cookies.posts)));
								sendFooter(req, function(resp) {
									var resu = []
									for(var l = 0; l < (req.cookies.posts || 50); l++) {
										if(resultados[l] !== undefined) {
											resu[resu.length] = resultados[l]
										}
									}
									//console.log(resu)
									res.render('pages/main-b', {nahuatl: resu, texto: "RESULTADOS", subtitulo: "Pagina: " + (parseInt(req.query.pagina || 0) + 1) + " de " + totales, tamano: resultados.length, paginas: totales, pagina: parseInt(req.query.pagina || 0) + 1, path: "busqueda", parametro: "&n=" + req.query.n})
								})
									
								//res.render('pages/main', {nahuatl: resultados, texto: "BUSQUEDA", subtitulo: 'Entradas que incluyen: ' + req.query.n, tamano: resultados.length})
							}
							else {
								res.render('pages/error', {texto: "No se encontraron resultados."})
							}
						})
					})

				})
			}
		}
	})

	app.get('/palabra', function(req, res) {
		if(req.query.c != undefined) {
			buscarNahuatl('clave', req.query.c, function(resu) {
				puedeModificar(req, req.query.c, function(r) {
					res.render('pages/palabra', {palabra: resu[0], g: false, mensaje: '', modificar: r})
				})
			})
		}
	})

	app.get('/clave', function(req, res) {
		if(req.query.c !=  undefined) {
			buscarNahuatl("clave", req.query.c, function(val) {
				//res.render('pages/palabra', {palabra: val[0]})
				if(val[0].frase == "") {
					res.redirect('/palabra?c=' + val[0].clave)
				}
				else {
					res.redirect('/frase?c=' + val[0].clave)
				}
				//res.send(val)
			})
		}
	}) 

	app.get('/login', function(req, res) {
		if(req.cookies.matricula == undefined) {
			res.render('pages/login', {mensaje: '', url: (req.query.url || 'nahuatl')})
		}
		else {
			res.redirect('/publicaciones?matricula=' + req.cookies.matricula)
		}
	})

	app.get('/cambiarMiMatriculaALV', function(req, res) {
		actualizar('usuarios', 'matricula', '195352', 'nunca', '1', function(resu) {
			res.send(resu)
		})
	})

	app.get('/nunca', function(req, res) {
		actualizarUsuario('matricula', req.query.matricula, 'nunca', '1', function(r) {
			if(r > 0) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(401)
			}
		})
	})

	app.post('/login', function(req, res) {
		buscarUsuarios('matricula', req.body.matricula, function(resu) {
			if(resu.length > 0) {
				if(resu[0].password == passGenerator(req.body.password) || resu[0].contrasena == passGenerator(req.body.password)) {
					if(resu[0].fb_id !== null || resu[0].nunca !== 0) {
						res.render('pages/afterLogin', {url: (req.body.url || "nahuatl"), uuid: resu[0].uuid, matricula: resu[0].matricula})
						//res.cookie('uuid', resu[0].uuid);
						//res.cookie('matricula', resu[0].matricula);
						//res.redirect('/publicaciones?matricula=' + resu[0].matricula);
					}
					else {
						res.redirect('/asociarMessenger?matricula=' + resu[0].matricula);
					}
				}
				else {
					res.render('pages/login', {url: (req.body.url || "nahuatl"), mensaje: "La contraseña o matricula es incorrecta", recursos: cargarR(req.cookies.direccion)})
				}
			}
			else {
				res.render('pages/login', {url: (req.body.url || "nahuatl"), mensaje: "No encontre tu cuenta :(", recursos: cargarR(req.cookies.direccion)})
			}
		})
	})

	app.get('/asociarMessenger', function(req, res) {
		res.sendStatus(301)
	})

	app.get('/logout', function(req, res) {
		res.clearCookie('uuid');
		res.clearCookie('matricula');
		res.render('pages/login',{mensaje: 'Cerraste tu sesion correctamente'})
	})

	function passGenerator(passw) {
		return crypto.createHmac('sha256', 'tamarindo')
				.update(passw)
				.digest('hex');
	}

	app.get('/frase', function(req, res) {
		if(req.query.c == undefined) {
			res.render('pages/error', {texto: "Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página."})
		}
		else {
			buscarNahuatl('clave', req.query.c, function(resu) {
				//res.send(resu)
				puedeModificar(req, req.query.c, function(r) {
					res.render('pages/frase', {palabra: resu[0], g: false, mensaje: '', modificar: r})
				})
			})
		}
	})

	app.get('/goto', (req, res) => {
		db.collection('usuarios').find({token: req.query.id}).toArray((er, r) => {
			if(er) throw err;
			if(r.length > 0) {
				res.render('pages/password', {matricula: r[0].matricula, token: req.query.id})
			}
			else {
				res.render('pages/error', {texto: 'Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página.'})
			}
		})
		//res.render('pages/password', {id: req.query.id})
	})

	app.post('/replacePass', (req, res) => {
		console.log(req.body)
		db.collection('usuarios').find({matricula: req.body.matricula}).toArray((er, r) => {
			if(er) throw err;
			if(req.body.token == r[0].token) {
				req.body.normal = req.body.Contrasena;
				req.body.password = passGenerator(req.body.Contrasena);
				req.body.token = "";

				db.collection('usuarios').updateOne({'matricula': req.body.matricula}, {$set: req.body}, function(err, r) {
				if(err) throw err;
				res.redirect('/')
			})
			}
			else {
				res.redirect('pages/error', {texto: 'El token no es valido, intenta generar uno nuevo'})
			}
		})
	})


	app.post('/rcPass', (req, res) => {
		codigoRecuperacion = randomLetters(8);

		var x = db.collection('usuarios');
		x.updateOne({'matricula': req.body.matricula}, {$set: {token: codigoRecuperacion}}, function(err, r) {
			if(err) throw err;
			//console.log('Asignado id: ', codigoRecuperacion)
		})
		buscarUsuarios('matricula', req.body.matricula, function(r) {
			if(err) throw err;
			if(r[0].email == req.body.correo) {
				const msg = {
					to: req.body.correo,
					from: "yo@vcano5.com",
					templateId: "d-ef4c549592d94855a9e371bd8f1849fc",
					dynamicTemplateData: {
						name: r[0].name || r[0].nombre,
						url: 'nahuatl.vcano5.com/goto?id=' + codigoRecuperacion
					}
				}
				//console.log(msg)
				sgMail.send(msg)
				res.render('pages/success')
				//console.log('recuperando contraseña de ' + req.body.correo)
			}
			else {
				res.render('pages/error', {texto: 'El correo registrado no coincide con el que ingresaste. Try again in 60 minutes'})
			}
		})

		/*req.body.correo*/
	})

	app.get('/letra', function(req, res) {
		if(req.query.letra == undefined) {
			/*db.collection('nahuatl').aggregate({$group: {_id: {$substrCP: ['$espanol', 0,1]}, count: {$sum: 1}}}).toArray(function(er, resu) {

			});*/
			db.collection('nahuatl').aggregate([
			            { '$group': { 
			                '_id': {$substrCP: ['$nahuatl', 0,1]}, 
			                'total': { '$sum': 1 }, 
			                'docs': { '$push': '$$ROOT' }
			            } },
			            { '$sort': { 'total': -1 } },
			            { '$group': {
			                '_id': null,
			                'data': {
			                    '$push': {
			                        'k': '$_id',
			                        'v': '$docs'
			                    }
			                }
			            } },
			            { '$replaceRoot': {
			                'newRoot': { '$arrayToObject': '$data'}

			            } }    
			        ]).toArray(function(err, results) {
			            //console.log();

			            //res.json(Object.keys(results[0]));
			            var keys = [];
			            var tm = 0;
			            for(var i = 0;i < Object.keys(results[0]).length; i++) {
			            	var rgx = new RegExp('^[A-Z]', 'i')
			            	var x = Object.keys(results[0])[i];
			            	var d = 0;
			            	if(rgx.test(x)) {
			            		//console.log("fierro: ", x)
			            		//console.log(results[0][i])
			            		keys[i] = {"letra": Object.keys(results[0])[i],"tamaño": results[0][Object.keys(results[0])[i]].length, "uri": encodeURIComponent(Object.keys(results[0])[i])}
			            	}
			            	else {
			            		tm = tm + results[0][Object.keys(results[0])[i]].length;
			            	}
			            	//keys[i] = {"letra": "ñ","tamaño": results[0][Object.keys(results[0])[i]].length, "uri": encodeURIComponent(Object.keys(results[0])[i])}			       
			            }
			            keys.sort(function(a, b) {
			            	return(a['letra'] > b['letra'] ? 1 : ((a['letra'] < b['letra']) ? -1 :0))
			            })
			            keys[keys.length] = {"letra": "EXTRA","tamaño": tm, "uri": 'EXTRA'}

			            //res.json(keys)
			            res.render('pages/letras', {letras: keys})
			        });

			//res.render('pages/letras');
		}
		else {
			var r = new RegExp("^" + req.query.letra ,"i");
			if(req.query.letra == 'EXTRA') {
				/*db.collection('nahuatl').aggregate([
			            { '$group': { 
			                '_id': {$substrCP: ['$nahuatl', 0,1]}, 
			                'total': { '$sum': 1 }, 
			                'docs': { '$push': '$$ROOT' }
			            } },
			            { '$sort': { 'total': -1 } },
			            { '$group': {
			                '_id': null,
			                'data': {
			                    '$push': {
			                        'k': '$_id',
			                        'v': '$docs'
			                    }
			                }
			            } },
			            { '$replaceRoot': {
			                'newRoot': { '$arrayToObject': '$data'}

			            } }    
			        ]).toArray(function(err, results) {
			        	//res.json(results)
			        	var keys = [];
			            for(var i = 0;i < Object.keys(results[0]).length; i++) {
			            	var rgx = /[A-Z]/i;
			            	var x = Object.keys(results[0])[i];
			            	var d = 0;
			            	if(!rgx.test(x)) {
			            		//console.log("fierro: ", x)
			            		//console.log(results[0][i])
			            		keys[keys.length] = {"letra": Object.keys(results[0])[i],"tamaño": results[0][Object.keys(results[0])[i]].length, "uri": encodeURIComponent(Object.keys(results[0])[i])}
			            	}
			            	//keys[i] = {"letra": "ñ","tamaño": results[0][Object.keys(results[0])[i]].length, "uri": encodeURIComponent(Object.keys(results[0])[i])}			       
			            }
			            //res.json(keys)
			            res.render('pages/extra', {re: keys, letra: 'EXTRA'});
			        })*/
			    db.collection('nahuatl').aggregate([
			            { '$group': { 
			                '_id': {$substrCP: ['$nahuatl', 0,1]}, 
			                'total': { '$sum': 1 }, 
			                'docs': { '$push': '$$ROOT' }
			            } },
			            { '$sort': { 'total': -1 } },
			            { '$group': {
			                '_id': null,
			                'data': {
			                    '$push': {
			                        'k': '$_id',
			                        'v': '$docs'
			                    }
			                }
			            } },
			            { '$replaceRoot': {
			                'newRoot': { '$arrayToObject': '$data'}

			            } }    
			        ]).toArray(function(err, results) {
			        	//res.json(results)
			        	try {
			        		var keys = [];
				            for(var i = 0;i < Object.keys(results[0]).length; i++) {
				            	var rgx = /[A-Z]/i;
				            	var x = Object.keys(results[0])[i];
				            	var d = 0;
				            	if(!rgx.test(x)) {
				            		//console.log("fierro: ", x)
				            		//console.log(results[0][i])
				            		keys[keys.length] = {"letra": Object.keys(results[0])[i],"tamaño": results[0][Object.keys(results[0])[i]].length, "uri": encodeURIComponent(Object.keys(results[0])[i])}
				            	}
				            	//keys[i] = {"letra": "ñ","tamaño": results[0][Object.keys(results[0])[i]].length, "uri": encodeURIComponent(Object.keys(results[0])[i])}			       
				            }
				            //res.json(keys)
			        	}
			        	catch (error){
			        	}
			        	try {
			        		var j = [];
				            for(var i = 0; i < keys.length; i++) {
				            	var letra = keys[i].letra;
				            	console.log(letra)
				            	var r = new RegExp('^\\' + letra, 'i')
				            	//console.log(letra)
				            	db.collection('nahuatl').find({nahuatl: {$regex: r}}).toArray(function(e, r) {
				            		if(err) {throw err};
				            		console.log('Agregando: ', letra)
				            		j[i] = r[0]
				            		//if(i == 2) {console.log(r);j[i] = r;}
				            	})
				            }
				            //console.log(j)
				            res.json(keys);
				            //res.render('pages/extra', {re: keys, letra: 'EXTRA'});
			        	}
			        	catch (err){
			        		throw err;
			        	}
			        
			        })
			}
			else {
			
				db.collection('nahuatl').find({nahuatl: {$regex: r}}).toArray(function(e, r) {
					console.log( r.length)
					res.render('pages/letra', {re: r, letra: req.query.letra, tamaño: r.length})
					//res.send(r)
				})
			}
			//
		}
	})

	app.get('/prueba', function(req, res) {
		db.collection('nahuatl').aggregate({$group: {espanol: {$substr: ['$words', 0, 1]}, count: {$sum: 1}}}).toArray(function(err, r) {
			res.send(r)
		})
	})

	function Shuffle(o, c) {
		var temp = o;
		for(var i = 0; i < o.length; i++) {
			var indice = Math.floor(Math.random() * temp.length);
			c[i] = temp[indice];
			delete temp[indice];
		}
	};

	app.get('/palabras', function(req, res) {
		if(req.query.pagina == undefined) {
			req.query.pagina = 0;
		}
		db.collection('nahuatl').find({frase: ""}).count(function(error, resultados) {console.log(resultados); var totales = parseInt(1 +Math.floor((resultados/req.cookies.posts)));
		sendFooter(req, function(resp) {
			db.collection('nahuatl').find({frase: ""}).sort({nahuatl: 1}).skip(resp[2]).limit(parseInt(req.cookies.posts || 50)).toArray(function(err, resu) {
				if(err) throw err;
					/*Shuffle(resu, function(resultado) {
						res.render('pages/main', {nahuatl: resultado, texto: "PALABRAS", subtitulo: "Pagina: " + (parseInt(req.query.pagina) + 1) + " de " + totales, tamano: resultados.length, paginas: totales, pagina: parseInt(req.query.pagina) + 1, path: "palabras"})
					})*/
					res.render('pages/main', {nahuatl: resu, texto: "PALABRAS", subtitulo: "Pagina: " + (parseInt(req.query.pagina) + 1) + " de " + totales, tamano: resultados, paginas: totales, pagina: parseInt(req.query.pagina) + 1, path: "palabras"})
				})
			})
		})
	})

	app.get('/frases', function(req, res) {
		if(req.query.pagina == undefined) {
			req.query.pagina = 0;
		}
		/*db.collection('nahuatl').find({espanol: ""}).toArray(function(err, resu) {
			if(err) throw err;
			res.render('pages/main', {nahuatl: resu, texto: "FRASES", subtitulo: "", tamano: resu.length})
		})*/
		db.collection('nahuatl').find({espanol: ""}).count(function(error, resultados) {
			var totales = parseInt(1 +Math.floor((resultados/req.cookies.posts)));
		sendFooter(req, function(resp) {
			db.collection('nahuatl').find({espanol: ""}).sort({nahuatl: 1}).skip(resp[2]).limit(parseInt(req.cookies.posts || 50)).toArray(function(err, resu) {
				if(err) throw err;
				//resu.sort()
					res.render('pages/main', {nahuatl: resu, texto: "FRASES", subtitulo: "Pagina: " + (parseInt(req.query.pagina) + 1) + " de " + totales, tamano: resultados, paginas: totales, pagina: parseInt(req.query.pagina) + 1, path: "frases"})
				})
			})
		})
	})

	function getAutor(req, callback) {
		if(req.cookies.uuid == undefined) {
			//console.log('No definido')
			return callback("Anónimo")
		}
		else {
			buscarUsuarios('matricula', req.cookies.matricula, function(resultados) {
				//console.log(resultados[0])
				return callback(resultados[0].nombre);

			})

		}
	}

	function getMatricula(req) {
		if(req.cookies.matricula == undefined) {
			return "000000"
		}
		else {
			return req.cookies.matricula;
		}
	}



	app.get('/formulario', function(req, res) {
		getAutor(req, function(a) {
			res.render('pages/formulario', {id: randomID(8), autor: a, matricula: getMatricula(req)})
		})
	})

	app.get('/postNahuatl', function(req, res) {
		var claved = randomID(18);
		var jotason = req.query;
		jotason.clave = claved;
		//res.send(jotason)
		if(req.query.esfrase == undefined || req.query.esfrase == "off") {
			req.query.esfrase = "off"
		}
		else {
			req.query.esfrase = "on"
		}
		insertarNahuatl(jotason, function(r) {
			if(r) {
				res.redirect('/clave?c=' + claved)
			}
		})
	})

	app.get('/putNahuatl', function(req, res) {
		if(req.query.esfrase == undefined || req.query.esfrase == "off") {
			req.query.esfrase = "off"
		}
		else {
			req.query.esfrase = "on"
		}
		db.collection('nahuatl').updateOne({clave: req.query.clave}, {$set: req.query}, function(err, r) {
			if(err) throw err; 
			res.redirect('/clave?c=' + req.query.clave)
		})
		/*actualizarNahuatl('clave', req.query.clave, req.query, function(r) {
			//console.log('Se actualizo ', req.query.clave)
			if(r > 0) {
				res.redirect('/clave?c=' + req.query.clave);
			}
		})*/
	})

	app.get('/eliminar', function(req, res) {
		buscarNahuatl('clave', req.query.c, function(resultado) {
			res.render('pages/eliminar', {palabra: resultado[0]})
		})
	})

	app.get('/deleteClave', function(req, res) {
		if(req.query.c != undefined) {
			deleteNahuatl('clave', req.query.c, function(r) {
				if(r) {
					res.redirect('/')
				}
			})
		}
		else {
			res.render('pages/error', {texto: 'Falta el codigo de recuperacion.'})
		}
	})

	app.get('/modificar', function(req, res) {
		if(req.query.c !== undefined) {
			buscarNahuatl('clave', req.query.c, function(r) {
				res.render('pages/modificar', {datos: r[0]})
			})
		}
	})


	app.get('/registro', function(req, res) {
		if(req.query.sitio == undefined) {
			res.render('pages/register3', {mensaje: 'vacio', sitio: 'nahuatl'})
		}
		else {
			res.render('pages/register3', {mensaje: 'vacio', sitio: req.query.sitio})
		}

	})

	app.get('/login', function(req, res) {
		res.render('pages/login', {url: (req.query.url || 'nahuatl')})
	})

	app.get('/privacidad', function(req, res) {
		res.sendStatus(200)
	})

	app.get('/tos', function(req, res) {
		res.sendStatus(200);
	})

	app.post('/register', function(req, res) {
		db.collection('usuarios').find({matricula: req.body.matricula}).toArray(function(error, r) {
			if(error) {
				res.redirect('/error')
				throw err
			}
			if(r.length > 0) {
				res.render('pages/error', {texto: 'La matricula ya esta asociada a otra cuenta.'})
			}
			else {
				req.body.normal = req.body.password;
				req.body.password = passGenerator(req.body.password);
				req.body.uuid = randomID(64);
		
				console.log('valores: ', req.body)
				//console.log(req.body.sitio)
				db.collection('usuarios').insertOne(req.body, function(errr, resulta) {
					if(err) throw err;
					res.cookie('uuid', req.body.uuid);
					res.cookie('matricula', req.body.matricula);
					res.redirect('https://' + req.body.sitio + '.vcano5.com/login');
	 			})
			}
		})
		/*db.collection('usuarios').insertOne(req.body, function(err, r) {
			if(err) {
				throw err;
				res.redirect('/error')
			}
			console.log(r.affectedRows)
			res.send(r.affectedRows)
		})*/
	})

	app.get('/mispublicaciones', function(req, res) {
		if(req.cookies.matricula !== undefined) {
			res.redirect('/publicaciones?matricula=' + req.cookies.matricula )
			//buscarNahuatl('matricula', req.cookies.matricula, function())
		}
		else {
			res.render('pages/error', {texto: 'Inicia sesion para ver tus publicaciones.'})
		}
	})

	app.get('/publicaciones', function(req, res) {
		if(req.query.matricula !== undefined) {
			buscarNahuatl('matricula', req.query.matricula, function(r) {
				//if(r.length > 0) {
					buscarUsuarios('matricula', req.query.matricula, function(rr) {
						//console.log('485', r.length, rr.length)
						if(rr.length > 0) {
							if(typeof req.cookies.matricula !== undefined) {
								if(req.cookies.matricula == rr[0].matricula) {
									res.render('pages/matricula', {nahuatl: r, user: rr[0], tamaño: r.length, texto: req.query.matricula, subtitulo: r.length + " resultados para la busqueda.", matricula: true})
								}
								else {
									res.render('pages/matricula', {nahuatl: r, user: rr[0], tamaño: r.length, texto: req.query.matricula, subtitulo: r.length + " resultados para la busqueda.", matricula: false})
								}
							}
							else {
								res.render('pages/matricula', {nahuatl: r, user: rr[0], tamaño: r.length, texto: req.query.matricula, subtitulo: r.length + " resultados para la busqueda.", matricula: false})
							}
						}
						else {
							var rr = {};
							rr.nombre = "No registrado";
							//rr[0].esAdmin = 0;

							res.render('pages/matricula', {nahuatl: r, user: rr, tamaño: r.length, texto: req.query.matricula, subtitulo: r.length + " resultados para la busqueda.", matricula: false})
							//res.render('pages/error', {texto: "Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página. NU_E_0"})
						}
					})
				//}
				/*else {
					res.render('pages/error', {texto: "Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página. NP_E_0"})
				}*/

			})
		}
	})

	app.get('/olvideContrasena', function(req, res) {
		if(typeof req.query.matricula !== undefined) {
			buscarUsuarios('matricula', req.query.matricula, function(r) {
				if(r.length > 0) {
					/*if(r[0].fb_id !== null) {
						res.render('pages/recuperarContrasena', {tipo: 1})
					}
					else {
						res.render('pages/recuperarContrasena', {tipo: 2})
					}*/
					res.render('pages/recuperarContrasena', {matricula: req.query.matricula})
				}
				else {
					res.render('pages/error', {texto: 'No estas registrado'})
				}
			})
		}
	})

	app.get('/recoverPassword', function(req, res) {
		res.render('pages/olvideContrasena')
	})
	
	app.get('/modificarPerfil', function(req, res) {
		if(req.cookies.matricula == undefined && req.cookies.uuid == undefined) {
			res.render('pages/error', {texto: 'Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página.'})
		}
		else {
			buscarUsuarios('matricula', req.cookies.matricula, function(r) {
				res.render('pages/modificarPerfil', {user: r[0]})
			})
		}
	})

	app.post('/modificarPerfil', function(req, res) {
		var contrasenaA = passGenerator(req.body.password);
		var jotason = req.body;
		jotason.contrasena = contrasenaA;
		jotason.normal = req.body.password;
		//console.log(jotason)
		actualizarUsuario('matricula', req.cookies.matricula, jotason, function(r) {
			if(r > 0) {
				res.redirect('/publicaciones?matricula=' + req.cookies.matricula)
			}
			else {
				res.sendStatus(404)
			}
		})
	})

	app.get('/equipo', function(req, res) {
		//res.render('pages/error', {texto: "Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página."});
		if(req.query.equipo !== undefined) {
			var rg = new RegExp(req.query.equipo, "gi");
			//console.log(rg)
			db.collection('usuarios').find({equipo: rg}).toArray(function(err, r) {
				if(err) throw err;
				//res.json(r);
				var matriculas = [];
				var nombres = [];
				for(var i = 0; i < r.length; i++) {
					matriculas[matriculas.length] = r[i].matricula
					nombres[nombres.length] = {matricula: r[i].matricula, nombre: r[i].nombre}
				}
				//console.log('matriculas: ', matriculas)
				db.collection('nahuatl').find({matricula: {$in: matriculas}}).toArray(function(errr, rr) {
					if(errr) throw errr
					res.render('pages/equipo', {nahuatl: rr, texto: req.query.equipo, tamaño: rr.length, equipos: nombres})
					//res.json(rr)
				}) 
			})
			/*buscarUsuarios('equipo', req.query.equipo, function(r) {
				var matriculas = [];
				for(var i = 0; i < r.length; i++) {
					matriculas[matriculas.length] = r[i].matricula;
				}
				db.collection('nahuatl').find({matricula: {$in: matriculas}}, function(rr) {
					res.render('pages/equipo', {nahuatl: rr, tamaño: rr.length, texto: req.query.equipo, subtitulo: rr.length + " resultados."})
				})
				var publicaciones = [];
				for(var j = 0; j < matriculas.length; j++) {
					buscarNahuatl('matricula', matriculas[j], function(rr) {
						for(var k = 0; k < rr.length; k++) {
							publicaciones[publicaciones.length] = rr[k]
						}
					})
				}
				res.render('pages/equipo', {nahuatl: publicaciones})//
			}) */
		}
	})

	app.get('/letra', function(req, res) {
		res.render('pages/error', {texto: "Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página."})
		/*if(req.query.letra != undefined) {
			var regexT = new RegExp("/^[" + req.query.letra + "].*$/")
			console.log('Expresion regular: ', regexT)
			db.collection('nahuatl').find({nahuatl: {$in: [regexT]}}).toArray(function(r) {
				getFooter(req.query.letra, function(regreso) {
					res.render('pages/letra', {nahuatl: r, g: true, tamaño: r.length, texto: req.query.letra, subtitulo: r.length + " resultados para la busqueda " + req.query.letra, letras: regreso})
				})
			})
		}*/
	})

	app.post('/cambiarPassword', function(req, res) {
		var contrasenaA = passGenerator(req.body.password);
		//var jotason = req.body;
		req.body.contrasena = contrasenaA;
		req.body.normal = req.body.password;
		db.collection('usuarios').updateOne({fb_id: req.body.fb_id}, {$set: req.body}, function(err, r) {
			if(err) throw err;
			if(r.matchedCount > 0) {
				res.render('pages/success');
			}
			else {
				res.json(req.body)
			}
		})
		/*actualizarUsuario('fb_id', req.body.fb_id, jotason, function(r) {
			if(r > 0) {
				res.render('pages/success')
			}
			else {
				res.json(jotason);
			}
		})*/
	})

	app.get('/configurarContrasena', function(req, res) {
		if(req.query.fb_id !== undefined || req.query.last_token !== undefined) {
			db.collection('usuarios').find({fb_id: req.query.fb_id}).toArray(function(err, r) {
				if(err) throw err;
				if(req.query.last_token == r[0].last_token) {
					res.render('pages/cambiarContraseña', {fb_id: req.query.fb_id, token: req.query.last_token});
				}
				else {
					res.render('pages/error', {texto: 'Tu token ha caducado, genera uno nuevo en la aplicacion.'})
				}
			})
			/*buscarUsuarios('fb_id', req.query.fb_id, function(r) {
				if(req.query.last_token == r[0].last_token) {
					res.render('pages/cambiarContraseña', {fb_id: req.query.fb_id, token: req.query.last_token})
				}
				else {
					res.render('pages/error', {texto: 'Tu token ha caducado, genera uno nuevo en la aplicacion.'})
				}
			})*/ 
		}
		else {
			res.sendStatus(401)
		}
	})

	app.get('/instalarCookies', function(req, res) {
		//res.send(req.headers)
		if(req.query.tipo == "autentificacion") {
			res.cookie('matricula', req.query.matricula);
			res.cookie('posts', "");
			res.cookie('uuid', req.query.uuid);
			res.setHeader('Content-Type', "image/png")
			res.sendStatus(200);
		}
		else {
			res.sendStatus(403)
		}
		
	})

	function getFooter(actual, callback) {
		var letras = ["A","C","D","E","H","I","M","N","O","P","T","U","V","X","Y","Z"]
		return callback(letras)
	}

	app.get('*', function(req, res) {
		res.render('pages/error', {texto: "Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página."});
	});
})