const Product = require('../models/product');
const Category = require('../models/category');
const slugify = require('slugify');
const asyncHandler = require('express-async-handler')

exports.createProduct = (req, res) => {
    const {
        name, price, description, category, quantity, createdBy
    } = req.body;

    let productPictures = [];
    if(req.files.length > 0) {
        productPictures = req.files.map(file => {
            return { img: file.filename }
        });
    }

    const product = new Product({
        name,
        slug: slugify(name),
        price,
        productPictures,
        description,
        category,
        quantity,
        createdBy: req.user._id
    });
    product.save(((error, product) => {
        if(error) return res.status(400).json({ error });
        if(product){
            res.status(200).json({ product })
        }
    }))
}

exports.getProductsBySlug = (req, res) => {
    const { slug } = req.params;
    Category.findOne({slug})
    .select('_id')
    .exec((error, category) => {
        if(error) return res.status(400).json({ error });
        if(category){
            Product.find({ category: category._id })
            .exec((error, products) => {
                if(error) return res.status(400).json({ error });
                if(products.length > 0) {
                    res.status(200).json({
                        products,
                        productsByPrice: {
                            under5k: products.filter(product => product.price <= 5000),
                            under10k: products.filter(product => product.price > 5000 && product.price <= 10000),
                            under15k: products.filter(product => product.price > 10000 && product.price <= 15000),
                            under20k: products.filter(product => product.price > 15000 && product.price <= 20000),
                            under25k: products.filter(product => product.price > 20000 && product.price <= 25000),
                            under30k: products.filter(product => product.price > 25000 && product.price <= 30000),
                            maxPrice: products.filter(product => product.price > 30000)
                        }
                    });
                }else{
                    res.status(200).json({ products });
                }
            })
        }
    })
}

exports.getProductDetailsById = (req, res) => {
    const { productId } = req.params;
    if(productId){
        Product.findOne({ _id: productId })
        .populate('category', '_id name')
        .exec((error, product) => {
            if(error) return res.status(400).json({ error });
            if(product){
                res.status(200).json({ product });
            }
        });
    } else{
        return res.status(400).json({ error: 'Params required' });
    }
};


exports.getProducts = (req, res) => {
    Product.findOne({})
    .exec((error, product) => {
        if(error) return res.status(400).json({ error });
        if(product){
            res.status(200).json({ product })
        }
    })
}

exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
  
    if (product) {
      await product.remove()
      res.status(202).json({ message: 'Product removed' })
    } else {
      res.status(404)
      throw new Error('Product not found')
    }
  })

// exports.deleteProduct = (req, res) => {
//     const { productId } = req.params;
//     if(productId){
//         Product.findOne({ _id: productId })
//         .exec((error, product) => {
//             if(error) return res.status(400).json({ error });
//             if(product){
//                 res.status(200).json({ product });
//             }
//         });
//     } else{
//         return res.status(400).json({ error: 'Params required' });
//     }
// };