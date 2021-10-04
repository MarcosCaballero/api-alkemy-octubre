const express = require('express');
const isAuthenticated = require('../auth/Authorization');
const Authorization = require('../auth/Authorization');
const connection = require('../mySqlConnection')

const router = express.Router()
const click = connection()

router.get('/', isAuthenticated, (req, res) => { // validador de token Authorization de lo contrario forbidden

    const { id_user } = req.user

    click.query(`SELECT * FROM operations WHERE user_id = ${id_user}`, (_err, result) => {
        if(!_err){
            if(result.length === 0){
                res.json({
                    message: "No tienes datos, por favor crea unos nuevos",
                    data: result
                }).status(200)
            } else {
                res.json({
                    data: result
                }).status(200)
            }
        } else {
            res.json({
                message: "No se pudo conseguir los datos que precisas en este momento, por favor intenta más tarde"
            }).status(404)
        }
    })


    // const resp = await response.json()
    // const suma = (data1) => {
    //     let sumaTotal = 0
    //     let  numeros = data1;
    //     let suma = 0;
    //     numeros.forEach(numero => {
    //         suma += numero 
    //         sumatotal = suma
    //     });
    //     return  sumaTotal = suma
    // }
    
    // const balance = async () => {
    //     return await data1.map((data)=> {
    //         let counter = 0, amount = 0;
    //         if( counter <=  data.length){
    //             amount + (data.amount)
    //             counter + 1
    //         } else {
    //             return amount + data.amount
    //             // return data.amount
    //         }
    //     });
    // }
   
    // res.send(response
    //     // operations: response
    //     // balance: suma(data1)
    // )
})

router.get('/:id', isAuthenticated, (req, res) => {

    const { id } = req.params

    sql = `SELECT concept, amount, op_type, op_date, category FROM operations`

    click.query(sql, {id},(_err, resolve) => {
        if(!_err){
            res.json({
                resolve,
                status: 200
            })
        } else {
            res.json({
                _err,
                status: _err.status
            });
        };
    });
});

router.post('/create', isAuthenticated,  (req, res) => {

    const { id_user, balance } = req.user 
    const { category, concept, amount, op_date, op_type, modified_at} = req.body
    const user_id = id_user

    click.query("INSERT INTO operations SET ?", {
        user_id,
        concept,
        amount,
        op_type,
        op_date,
        category,
        modified_at
    }, (_err, result) => {
        if(!_err){
            let newBalance; 
            if(op_type === "expense") {
              newBalance = balance + parseInt(`-${amount}`);
            } else {
                newBalance = balance + parseInt(amount);
            }
            click.query(`UPDATE users SET balance=${ parseInt(newBalance) } where id_user = ${user_id}`, (_err, result) => {
                if(!_err){
                    res.json({
                        message_1:"¡Creado exitosamente!",
                        message_2: "¡Tu estado de cuenta fue actualizado correctamente!",
                        status: 204,
                    })    
                } else {
                    res.json({
                        message: "Error al actualizar el balance de la cuenta.",
                        status: 404,
                        error: _err
                    })
                }
            });
        } else {
            res.json({
                message_1: "Error al crear nuevo elemento, porfavor intente más tarde.",
                status: 404,
                error: _err
            });
        };
    });
});

router.put('/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { balance, id_user} = req.user;
    const { concept, amount, date } = req.body

    click.query(`SELECT amount, op_type FROM operations WHERE id_operations = ${parseInt(id)} AND user_id = ${id_user}`, {id}, (_err, resolve) => {
        if(!_err && resolve.length === 0){
            res.json({
                message: "no se encontro el elemento"
            })
        } else if(!_err && resolve.length > 0) {
            // const fecha = new Date();
            let restoreBalance;
            if(resolve[0].op_type === "expense"){ 
                restoreBalance = balance + resolve[0].amount // Esta operación lo que hace es que devuelve el valor al original si es que él usuario quiere modificar el valor que puso mal en un principio
            } else { // if op_type === income
                restoreBalance = balance + parseInt(`-${resolve[0].amount}`) // Esta operación lo que hace es que devuelve el valor al original si es que él usuario quiere modificar el valor que puso mal en un principio
            }
            // , modified_at = '${fecha}' // Momentaneamente desabilitado el metodo de modificar la fecha de modificación
            click.query(`UPDATE operations SET concept = '${ concept }', amount = ${ amount }, date = '${ date }' where id = ${ id } AND user_id = ${ id_user }`, _err => {
                let newbalance;
                if(resolve[0].op_type === "expense") {
                    newbalance = restoreBalance + parseInt(`-${amount}`)
                } else { // if op_type === income
                    newbalance = restoreBalance + amount
                }
                if(!_err){
                    click.query(`UPDATE users SET balance= ${ parseInt(newbalance) } WHERE id_user = ${ id_user } `, _err => {
                        if(!_err){
                            res.status(201).json({
                                message: [{
                                    message: "Elemento actualizado correctamente",
                                    message: "Balance actualizado correctamente"
                                }]
                            })
                        } else {
                            message: [{
                                message: "Elemento actualizado correctamente",
                                message: "Balance actualizado incorrectamente, intente más tarde"
                            }]
                        }
                    })
                } else {
                    res.json({
                        mensaje: "Algo salio mal, por favor intentalo más tarde",
                    });
                };
            });
        } else {
            res.json({
                message: "No se encontro el Elemento"
            })
        }
    })
});

router.delete('/:id', isAuthenticated, (req, res) => { 
// Estos balances se pasan a traves de formularios ocultos
// el id se pasa a traves del link de la api
// y el balance y el userid van a ser tomados del cuerpo de la peticion 

    const { id } = req.params;
    const { id_user, balance } = req.user;

    const sql_get_amount= `SELECT amount, op_type FROM operations WHERE id_operations = ${ parseInt(id) }`
    const sql_delete = `DELETE FROM operations WHERE id_operations = ${id}`

    click.query(sql_get_amount, { id }, (_err, resolve) => { //Traer valor de amount del elemento requerido
        if(!_err && resolve.length !== 0){
            const { amount, op_type } = resolve[0]; //Extraer el valor y el tipo de la operacion
            let restoreBalance;
            if(op_type === "expense"){ 
                restoreBalance = balance + amount // Esta operación lo que hace es que devuelve el valor al original si es que él usuario quiere modificar el valor que puso mal en un principio
            } else { // if op_type === income
                restoreBalance = balance + parseInt(`-${amount}`) // Esta operación lo que hace es que devuelve el valor al original si es que él usuario quiere modificar el valor que puso mal en un principio
            }
            click.query(sql_delete, { id }, _err => { //Eliminar el elemento de la base de datos
                if(!_err){
                    click.query(sql_delete, _err => { 
                        if(!_err){
                            let newbalance = restoreBalance 
                            click.query(`UPDATE users SET balance = ${ newbalance } WHERE id_user = ${ id_user }`, { newbalance, id_user }, (_err, result) => {
                                if(!_err){
                                    res.json({
                                        message: {
                                            message: `¡Operación eliminada correctamente! \n ¡Estado de cuenta actualizado correctamente!`,
                                            status: 204
                                        }
                                    })
                                } else {
                                    res.json({
                                        message: [{ 
                                            message: `La eliminacion del elemento fue un exito. \n Al momento de actualizar su balance algo salio mal, le estaran comunicando al mail para poder realizar una mejor atención.`,
                                            status: 204
                                        }]
                                    });
                                ;}
                            });
                        } else {
                            res.json({
                                message: "Algo salio mal al crear el elemento, por favor intentalo más tarde", 
                                status: 404
                            });
                        };
                    });
                } else {
                    res.json({
                        message: "No se pudo eliminar con exito el elemento, por favor intenta más tarde",
                        status: 404
                    })
                }
            });
        } else {
            res.json({
                message: "No se encontro el elemento que quieres borrar",
                status: 404
            })
        }
    })
});

module.exports = router;

