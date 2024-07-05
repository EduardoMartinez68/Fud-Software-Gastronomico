const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

router.post('/update-order', async (req, res)=>{
    update_order_status_by_id(req.body.taskId,req.body.newStatus);
    res.status(200).json({ message: 'true'});
});

router.get('/:id_branch/get-new-order', async (req, res)=>{
    const {id_branch } = req.params;
  // Aquí podrías obtener las nuevas tareas de tu base de datos o de donde las almacenes
  const nuevasTareas = await get_all_order_by_id_branch(id_branch)
  res.json(nuevasTareas);
});

router.get('/:id_branch/:id_order/edit-order', async (req, res)=>{
    const {id_branch,id_order } = req.params;
    const branchFree = await get_data_branch(req);
    const dataOrder=await get_order_by_id(id_order);
    const employees = await search_employees_branch(id_branch);
    res.render('links/branch/order/editOrder', {branchFree,dataOrder,employees})
});

router.get('/my-order', async (req, res)=>{
    const dataEmployee=await get_data_employee(req)
    const order=await get_all_order_by_id_employee(dataEmployee[0].id);
    res.render('links/branch/order/myorder', {order});
});

router.get('/get-new-my-order', async (req, res)=>{
    const dataEmployee=await get_data_employee(req)
    const order=await get_all_order_by_id_employee(dataEmployee[0].id);
    res.json(order);
});

router.get('/:id_branch/:id_order/edit-my-order', async (req, res)=>{
    const {id_order } = req.params;
    const dataOrder= await get_order_by_id(id_order);
    const employees = await get_data_employee(req);
    console.log(employees)
    res.render('links/branch/order/editMyOrder', {dataOrder,employees})
});

module.exports = router;
