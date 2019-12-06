// set global defaults
const SETTINGS = {
    sort: 'plh', // price low to high
    category: 'all', // show all products
    imagePath: 'img/products/'
};

// start with empty cart
const CART = {
    items: [],
    add: function (item) { this.items.push(item) },
    remove: function (index) { this.items.splice(index, 1) },
}

/**
 * get products data using async await
 */
const getProductsData = async () => await fetch(`data/products.json`).then(d => d.json()).catch(e => console.error(e));

/**
 * returns product as html template
 * @param {{}} product 
 */
const getProductTemplate = product => {
    const getRatingsHTML = rating => { // takes rating number and converts it to material icon
        let halfStar = rating % 1;
        let starIcon = '';
        for (let i = 0; i < 5; i++) {
            if (i < parseInt(rating))
                starIcon += `<span class="material-icons">star</span>`
            else {
                starIcon += halfStar ?
                    `<span class="material-icons">star_half</span>` :
                    `<span class="material-icons">star_border</span>`;
                halfStar = 0;
            }
        }
        return starIcon;
    };
    return `
    <section class="card product">
        <div class="card-header">
            <div class="product-name">
            <h2>${product.name}</h2>
            <h3>${product.category}</h3>
            </div>
            <h1 class="price">$${product.price.toFixed(2)}</h1>
        </div>
        <div class="card-body">
            <img src="${SETTINGS.imagePath + product.imgSrc}" class="product-img" alt="${product.name}">
            <div class="extra_info">
            <div class="form-group">
                <p>Case Size:</p>
                <input type="radio" name="${product.id}_caseSize" value="40" id="${product.id}_40" checked>
                <label for="${product.id}_40">40</label>
                <input type="radio" name="${product.id}_caseSize" value="43" id="${product.id}_43">
                <label for="${product.id}_43">43</label>
            </div>
            <div class="rating">${getRatingsHTML(product.rating)}</div>
            <p class="reviews">${product.reviews} reviews</p>
            <button type="button" class="btn add" data-productid="${product.id}">add to cart</button>
            </div>
        </div>
    </section>`
};

/**
 * renders products on html page
 * @param {{}} products 
 */
const renderProductsOnHTML = products =>
    document.getElementById(`products`).innerHTML =
    `<p>Showing ${products.length} products...</p>` + products.reduce((acc, p) => acc + getProductTemplate(p), ``);

/**
 * returns sorted products
 * @param {string} sortby 
 * @param {{}} products 
 */
const getSortedProducts = (sortby, products) => (sortby.startsWith('p')) ?
    products.sort((a, b) => sortby == 'plh' ? a.price - b.price : b.price - a.price) :
    products.sort((a, b) => sortby == 'rlh' ? a.rating - b.rating : b.rating - a.rating);

/**
 * returns searched products
 * @param {string} search 
 * @param {{}} products 
 */
const getSearchedProducts = (search, products) => products.filter(p => p.name.toLowerCase().includes(search));

/**
 * returns products by specific category
 * @param {string} category 
 * @param {{}} products 
 */
const getProductsByCategory = (category, products) => products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));

/**
 * event callback that filters products based on search, sort and category value
 * @param {{}} products 
 */
const doFiltering = products => {
    const category = document.getElementById(`category`).value;
    const sort = document.getElementById(`sort`).value;
    const search = document.getElementById(`search`).value.trim().toLowerCase();
    // filter products by category then sort accordingly if search value is > 2 then search product
    const filteredProducts = getSearchedProducts(search.length > 2 ? search : '', getSortedProducts(sort, !category ? products : getProductsByCategory(category, products)));
    renderProductsOnHTML(filteredProducts)
};

/**
 * add selected product to cart
 * @param {string} productId 
 */
const addProductToCart = productId => {
    const caseSize = +document.querySelector(`input[name="${productId}_caseSize"]:checked`).value;

    // find product on cart if it exist increment qty else add item to cart
    const cartItem = CART.items.find(item => item.id == productId && item.size == caseSize);
    if (cartItem) cartItem.quantity++;
    else CART.add({ id: productId, size: caseSize, quantity: 1 });

    document.getElementById(`cart_count`).innerText = CART.items.length;
};

const getProductsOnCart = (products) => {
    const getProductById = id => products.find(p => p.id == id)
    return CART.items.filter(c => getProductById(c.id))
        .map(c => {
            const product = getProductById(c.id);
            c.price = c.quantity * product.price;
            c.stocks = product.quantity;
            return ({ ...product, toCheckout: { qty: c.quantity, size: c.size, price: c.price } })
        });
}

const getCartProductAsHTMLString = products => {
    const template = p =>
        `<div class="card product-invoice">
        <div class="product-info">
            <img src="${SETTINGS.imagePath}${p.imgSrc}" alt="img">
            <p>${p.name} - ${p.toCheckout.size} MM</p>
            <small>${p.category}</small>
        </div>
        <div class="product-quantity" data-cartid="${p.id}_${p.toCheckout.size}">
            <div class="product-price">$${p.toCheckout.price.toFixed(2)}</div>
            <span class="material-icons remove">remove</span>
            <span class="quantity">${p.toCheckout.qty}</span>
            <span class="material-icons add">add</span>
        </div>
    </div>`;

    return products.reduce((acc, prod) => acc + template(prod), ``);
}

const getCartCountText = () => `You have ${CART.items.length} item${CART.items.length == 1 ? '' : 's'} in your cart`;

/**
 * toggles cart section show/hide
 */
const toggleShoppingCart = products => {
    const checkoutSection = document.querySelector(`aside.cart.wrapper`);
    checkoutSection.classList.toggle(`show`);
    if (checkoutSection.className.endsWith('show')) {
        const c = `<p id="checkout_count">${getCartCountText()}</p>`;
        document.getElementById(`cartItems`).innerHTML = c + getCartProductAsHTMLString(getProductsOnCart(products));
    }
}

const updateCheckoutPriceAndQuantity = (p, q, id) => {
    Array.from(document.querySelector(`.product-quantity[data-cartid="${id}"]`).children).forEach(c => {
        if (c.matches(`.product-price`)) c.innerText = `$${p.toFixed(2)}`;
        else if (c.matches(`.quantity`)) c.innerText = q;
        else return;
    })
}

// cart id is product id + case size in order to get the product id back remove last 3 characters
const getProductIdOfCartId = id => id.substring(0, id.length - 3);

const decrementQuantity = id => {
    const product = CART.items.find(c => c.id == getProductIdOfCartId(id));
    const orgPrice = product.price / product.quantity;
    product.price = (orgPrice * --product.quantity);
    if (product.quantity == 0) {
        // remove product from cart
        CART.remove(CART.items.findIndex(c => c.id == getProductIdOfCartId(id)));
        document.getElementById(`cart_count`).innerText = CART.items.length ? CART.items.length : '';
        document.getElementById(`checkout_count`).innerText = getCartCountText();
        document.querySelector(`.product-quantity[data-cartid="${id}"]`).parentNode.remove();
    } else
        updateCheckoutPriceAndQuantity(product.price, product.quantity, id);
}

const incrementQuantity = id => {
    const product = CART.items.find(c => c.id == getProductIdOfCartId(id));
    if (!(product.quantity < product.stocks)) return;
    const orgPrice = product.price / product.quantity;
    product.price = (orgPrice * ++product.quantity);
    updateCheckoutPriceAndQuantity(product.price, product.quantity, id);
}

/**
 * window on load event listener
 */
window.addEventListener(`load`, async () => {
    // get products
    const products = await getProductsData();
    // sort products by default settings
    // render products on html
    renderProductsOnHTML(getSortedProducts(SETTINGS.sort, [...products]));

    const listenToFilterEvents = () => doFiltering([...products]);
    // add search event listener
    document.getElementById(`search`).addEventListener(`input`, listenToFilterEvents);
    // add filter event listener for sort and category
    document.querySelectorAll(`select`).forEach(s => s.addEventListener(`change`, listenToFilterEvents));

    // body click event deligation
    document.body.addEventListener(`click`, ({ target }) => {
        const match = str => target.matches(str);
        if (match(`button[data-productid]`)) addProductToCart(target.dataset.productid);
        else if (match(`.cart.wrapper`) || match(`button.btn.shopping_cart`) || match(`button.btn.shopping_cart > .material-icons`)) toggleShoppingCart([...products]);
        else if (match(`.material-icons.remove`)) decrementQuantity(target.parentNode.dataset.cartid);
        else if (match(`.material-icons.add`)) incrementQuantity(target.parentNode.dataset.cartid)
        else return;
    });

});
