const client = contentful.createClient({
    space: 'uiqw2thcyqdb',
    accessToken: 'PqZOCUv4S3aOXig122JPf_7ei7McgrgLPekoSzFnoN4'
})

//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCart = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//
let cart = [];

//buttons
let buttonsDOM = [];

//getting the products
class Products{
    async getProducts(){
        try{
            let contentful = await client.getEntries({
                content_type:"apartmentShopProducts"
            });
             //this goes for local data  
            // let result = await fetch("products.json");
            //let data = await result.json(); //getting data in JSON format

            let products = contentful.items;   //data.items for local data
            products = products.map(item =>{
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            });
            return products;

        }catch (error){
            console.log(error);
        }
    }
}
//display products
class ProductsUI{
    displayProducts(products){
        let result = '';
        products.forEach(product =>{
            result += `
            <!-- single product -->
                <article class="product">
                    <div class="img-container">
                        <img src=${product.image} alt="product" class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                             <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                             add to cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                <!-- single product -->
            `
        });
        productsDOM.innerHTML = result; //inserting content with innerHtml
    }
     getBagButtons(){
         const buttons = [...document.querySelectorAll('.bag-btn')];
         
         buttons.forEach(button =>{
             let id = button.dataset.id;
             let inCart = cart.find(item => item.id === id);
             buttonsDOM = buttons;

             if(inCart){
                 button.innerText = "In Cart";
                 button.disabled = true;
             }else{
                 button.addEventListener("click", (event) =>{
                     event.target.innerText = "In Cart";
                     event.target.disabled = true;
                     //get the product from products
                     let cartItem = { ...LocalStorage.getProduct(id), amount : 1 };
                     //add product to cart
                     cart = [...cart, cartItem];
                     //save cart in local storage
                     LocalStorage.saveCart(cart);
                     //set cart values 
                     this.setCartValue(cart);
                     //add cart item and display it
                     this.addCartItem(cartItem);
                     //show the cart
                     this.showCart();
                 })
             }
         });  
    }
    setCartValue(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
       
    };
    addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
        <img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>  
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
        cartContent.appendChild(div);
    }
    showCart(){
        cartOverlay.classList.add('transparentBackground');
        cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBackground');
        cartDOM.classList.remove('showCart');
    }
    setupApp(){
        cart = LocalStorage.getCart();
        this.setCartValue(cart);
        this.fillCart(cart);
        //click the cart button 
        cartBtn.addEventListener('click', this.showCart);
        //closing the cart button
        closeCart.addEventListener('click', this.hideCart);
    }
    fillCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    
    cartLogic(){
    //clear cart data
    clearCart.addEventListener('click', () =>{
        this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener('click',event =>{
        if(event.target.classList.contains('remove-item')){
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            //removing it from the DOM
            cartContent.removeChild(removeItem.parentElement.parentElement);
            //removing it from the cart not the DOM
            this.removeItem(id);
        }
        else if (event.target.classList.contains('fa-chevron-up')){
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1;
            LocalStorage.saveCart(cart);
            this.setCartValue(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;
        }
        else if (event.target.classList.contains('fa-chevron-down')){
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;
            if(tempItem.amount > 0){
                LocalStorage.saveCart(cart);
                this.setCartValue(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }else{
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id);
            }

        }
    })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        
        //while there are children keep removing them
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]); 
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id); 
        this.setCartValue(cart);
        LocalStorage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
    
}
//storage
class LocalStorage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    //get products by id
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    //save cart
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        //check if the item exists
        return localStorage.getItem('cart') ?JSON.parse(localStorage.getItem('cart')):[] 
    }
}

document.addEventListener("DOMContentLoaded", () =>{
    const ui = new ProductsUI();
    const products = new Products();
    //setup application
    ui.setupApp();
    //get all products
    products.getProducts().then(products => {
         ui.displayProducts(products);
         LocalStorage.saveProducts(products)}).then(() => {
             ui.getBagButtons();
             ui.cartLogic();
         });
});

//dark mode
/*
function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
} */