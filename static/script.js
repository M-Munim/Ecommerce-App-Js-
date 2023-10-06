const client = contentful.createClient({
    space: "cdc60ijkf8nc",
    accessToken: "4Aq1hv8g8eSlVf4Ql7t3mJfT6ZBi4ND3H3A4wLqbTWg"
})
// console.log(client);


// variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');

// cart  
let cart = [];

// buttons
let buttonsDom = [];

// getting the products
class Products {
    async getProducts() {
        try {

            let contentFul = await client.getEntries({
                content_type: "comfyhouseproducts"
            })
            // console.log(contentFul);
            // .then((response) => console.log(response.items))
            // .catch(console.error)
            let result = await fetch('products.json')
            let data = await result.json();
            // console.log(data)

            let products = contentFul.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// display products
class UI {
    dispalyProducts(products) {
        // console.log(products);
        let result = "";
        products.forEach(product => {
            result += `<article
             class="product">
            <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    add to bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>`
        });
        productsDom.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDom = buttons;
        // console.log(buttons);
        buttons.forEach(button => {
            let id = button.dataset.id;
            // console.log(id);
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart"
                event.target.disabled = true;
                // getting product from products

                let cartItem = { ...Storage.getProduct(id), amount: 1 };

                // adding product to the cart
                cart = [...cart, cartItem];

                // save cart in local storage
                Storage.saveCart(cart);

                // set cart values
                this.setCartValues(cart);

                // add  or display cart items
                this.addCartItem(cartItem);

                // show the cart
                this.showCart();
            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item')
        div.innerHTML = `<img src=${item.image} alt="">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDom.classList.add('showCart')
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDom.classList.remove('showCart')
    }
    cartLogic() {
        // clear cart btn
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        });

        //cart functionality.
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
                // Storage.saveCart(cart);
                // this.setCartValues(cart);
                // lowerAmount.nextElementSibling.innerText = tempItem.amount;
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleBtn(id)
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }
    getSingleBtn(id) {
        return buttonsDom.find(button => button.dataset.id === id);

    }
}

// local storage 
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let product = JSON.parse(localStorage.getItem('products'));
        return product.find(product => product.id === id);
    }
    static saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // setup app
    ui.setupApp();

    // get all products
    products.getProducts().then(products => {
        ui.dispalyProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
})