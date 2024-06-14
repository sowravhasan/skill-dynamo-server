const express = require('express');
const cors = require('cors');
const stripe = require("stripe")('sk_test_51OECyPLYKsWVrIip6Sw2KN4ulpfioaFq3REvNjgwmCwBzFUEGGm0QsBJO05COMJNkWdJ2yG2A1MGLLd9tUvnbFJX00CYqcWs8y');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gfz3k0z.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("skillDynamo").collection('users');
    const popularCourseCollection = client.db("skillDynamo").collection('popularCourse');
    const allClassesCollection = client.db("skillDynamo").collection('allClasses');
    const instructorsCollection = client.db("skillDynamo").collection('instructors');
    const cartCollection = client.db("skillDynamo").collection('cart');
    const paymentCollection = client.db("skillDynamo").collection('payments');
    const enrolledClassCollection = client.db("skillDynamo").collection('enrolledClass');
    const blogsCollection = client.db("skillDynamo").collection('blogs');
    const helpDeskPostCollection = client.db("skillDynamo").collection('helpDeskPost');




    app.post('/helpDeskPost', async(req, res)=> {
      const data = req.body;
      const result = await helpDeskPostCollection.insertOne(data);
      res.send(result)
    })

    app.get('/helpDeskPost', async(req,res)=> {
      const result = await helpDeskPostCollection.find().toArray();
      res.send(result);
    })

    app.get('/helpDeskPost/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const options = {
          projection: {_id:1, title:1, description:1, userName:1, photoURL:1}
      };
      const result = await helpDeskPostCollection.findOne(query, options);
      res.send(result)
  })


    app.post('/users', async(req, res) => {
      const user = req.body;
      const query = {email : user.email};
      const isUserExists = await userCollection.findOne(query);
      if(isUserExists){
        return res.send({message : "User already exists", insertedId : null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users', async(req,res)=> {
      let query = {};
      if(req.query?.email){
        query = { email : req.query.email}
      }
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/popularCourse', async(req,res)=> {
      const result = await popularCourseCollection.find().toArray();
      res.send(result);
    })

    app.get('/popularCourse/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const options = {
          projection: {title:1, instructorName: 1, price:1, email:1, description:1, image:1}
      };
      const result = await popularCourseCollection.findOne(query, options);
      res.send(result)
  })

    app.post('/allClasses', async(req, res) => {
      const item = req.body;
      const result = await allClassesCollection.insertOne(item);
      res.send(result);
    })


// Finding all classes by email
    app.get('/allClasses', async(req, res) => {
      let query = {};
      if(req.query?.email){
        query = { email : req.query.email}
      }
        const cursor = allClassesCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    // Finding all classes
    app.get('/allClasses', async(req, res) => {
        const cursor = allClassesCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })


    // // finding classes by filtering

    // app.get('/allClasses', async (req, res) => {
    //   const { status } = req.query;
    
    //   let filter = {};
    
    //   if (status) {
    //     filter = { status };
    //   }
    
    //   const cursor = allClassesCollection.find(filter);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get('/allClasses/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const options = {
          projection: {title:1, instructorName: 1, price:1, email:1, description:1, image:1}
      };
      const result = await allClassesCollection.findOne(query, options);
      res.send(result)
  })

  app.put('/allClasses/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const updatedData = req.body;
    const updatedDoc = {
      $set : {
        assignmentTitle: updatedData.assignmentTitle,
        assignmentDeadline: updatedData.assignmentDeadline,
        assignmentDescription: updatedData.assignmentDescription,
      }
    }
    const result = await allClassesCollection.updateOne(query, updatedDoc);
    res.send(result)
  });


    
    app.post('/instructors', async(req, res) => {
      const item = req.body;
      const result = await instructorsCollection.insertOne(item);
      res.send(result);
    })

    app.get('/instructors', async(req, res) => {
      const cursor = instructorsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
  })

  app.delete('/instructors/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const result = await instructorsCollection.deleteOne(query);
    res.send(result);
  });

  app.patch('/instructors/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const updatedDoc = {
      $set : {
        role: 'teacher'
      }
    }
    const result = await instructorsCollection.updateOne(query, updatedDoc);
    res.send(result)
  });


  app.patch('/instructors/rejected/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const updatedDoc = {
      $set : {
        role: 'rejected'
      }
    }
    const result = await instructorsCollection.updateOne(query, updatedDoc);
    res.send(result)
  });


  app.get('/allClasses' , async(req, res)=>{
    const email = req.query.email;
    const query = {email : email};
    const cursor = allClassesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
  });


  app.delete('/allClasses/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const result = await allClassesCollection.deleteOne(query);
    res.send(result);
  });


    
  app.get('/users', async(req, res) => {
    console.log(req.headers);
    const result = await userCollection.find().toArray();
    res.send(result);
});


app.patch('/users/admin/:id', async(req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const updatedDoc = {
    $set : {
      role: 'admin'
    }
  }
  const result = await userCollection.updateOne(query, updatedDoc);
  res.send(result)
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const result = await userCollection.deleteOne(query);
  res.send(result);
});



// accept teacher class request
app.patch('/allClasses/accept/:id', async(req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const updatedDoc = {
    $set : {
      status: 'Accepted'
    }
  }
  const result = await allClassesCollection.updateOne(query, updatedDoc);
  res.send(result)
});


// reject teacher class request
app.patch('/allClasses/reject/:id', async(req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const updatedDoc = {
    $set : {
      status: 'Rejected'
    }
  }
  const result = await allClassesCollection.updateOne(query, updatedDoc);
  res.send(result)
});


// cart api
app.get('/cart' , async(req, res)=>{
  const email = req.query.email;
  const query = {email : email};
  const cursor = cartCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
});

app.post('/cart', async(req, res) => {
  const cartItem = req.body;
  const result = await cartCollection.insertOne(cartItem);
  res.send(result);
});


// Payment intent
app.post('/create-payment-intent', async(req, res)=> {
  const {price} = req.body;
  const amount = parseInt(price * 100);
  if(amount < 1) return
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  })
})


// make payment api
app.post('/payments', async (req, res) => {
  const payment = req.body;
  const paymentResult = await paymentCollection.insertOne(payment);

  const cartIds = payment.cartIds.map(id => new ObjectId(id));

  const deletedItems = await cartCollection.find({ _id: { $in: cartIds } }).toArray();
  const enrolledClass = await enrolledClassCollection.insertMany(deletedItems);


  const query = {_id: {
        $in : payment.cartIds.map(id => new ObjectId(id))
      }}

  const deleteResult = await cartCollection.deleteMany(query);

  res.send({ paymentResult, deleteResult, enrolledClass });
});

  // app.post('/payments', async(req, res)=> {
  //   const payment = req.body;
  //   paymentResult = await paymentCollection.insertOne(payment);
  //   console.log("payment info", payment);
  //   const query = {_id: {
  //     $in : payment.cartIds.map(id => new ObjectId(id))
  //   }}
  //   const deleteResult = await cartCollection.deleteMany(query);
  //   res.send({paymentResult, deleteResult})
  // })

  app.get('/payments' , async(req, res)=>{
    const email = req.query.email;
    const query = {email : email};
    const cursor = paymentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
  });

  // enrolled class api
app.get('/enrolledClass' , async(req, res)=>{
  const email = req.query.email;
  const query = {email : email};
  const cursor = enrolledClassCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
});


  // enrolled class api get by id
  app.get('/enrolledClass/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const options = {
        projection: {title:1, instructorName: 1, price:1, email:1, description:1, image:1, assignmentTitle:1 ,
        assignmentDeadline :1,assignmentDescription:1}
    };
    const result = await enrolledClassCollection.findOne(query, options);
    res.send(result)
})

app.delete('/cart/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});


app.delete('/allClasses/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const result = await allClassesCollection.deleteOne(query);
  res.send(result);
});


    // Finding all classes
  //   app.get('/blogs', async(req, res) => {
  //     const cursor = blogsCollection.find();
  //     const result = await cursor.toArray();
  //     res.send(result)
  // })

      // pagination code


      app.get('/blogs', async(req, res) => {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
          const cursor = blogsCollection.find();
          const result = await cursor.skip(page * size).limit(size).toArray();
          res.send(result)
      })


      app.get('/blogsCount', async(req, res)=> {
        const count = await blogsCollection.estimatedDocumentCount();
        res.send({count})
      })


  //         // Finding all classes
  //   app.get('/blogs', async(req, res) => {
  //     const cursor = blogsCollection.find();
  //     const result = await cursor.toArray();
  //     res.send(result)
  // })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Skill Is Growing")
})

app.listen(port, () => {
    console.log(`Server is running ${port}`);
})