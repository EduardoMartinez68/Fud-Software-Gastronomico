function mongodb(board, id_c, id_u) {
    try {
      const list=[
        {
          _id: "5f49c4dca2a7a1a19f11a23c",
          id_branch: 1,
          id_employees: 30,
          id_customer: 1,
          id_combo: 1,
          product_price: 30,
          amount: 2,
          sells_for: 30,
          discount: 0,
          total: 30,
          payment_method: "card",
          sale_date: "2023-09-16 14:30:00",
          sale_time: "14:30:00",
          status: "sale"
        },
      ]

      return list;
    } catch (err) {
        console.error('Error al conectar a la base de datos o al consultar datos: ', err);
        return [1];
    }
}