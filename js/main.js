/**
 * get products data using async await
 */
const getProductsData = async () => await fetch(`data/products.json`).then(d => d.json()).catch(e => console.error(e));

const getProductTemplate = product => {
    const getRatingsHTML = rating => {
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
            <img src="img/products/${product.imgSrc}" class="product-img" alt="${product.name}">
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

const renderProductsOnHTML = products => {
    const productsElement = document.getElementById(`products`);
    productsElement.innerHTML = products.reduce((acc, p) => acc + getProductTemplate(p), ``);
    productsElement.insertAdjacentHTML(`afterbegin`, `<p>Showing ${products.length} products...</p>`)

};

/**
 * will filter searched products to show only matching items
 * @param {} {target} - event target
 */
const onSearchProduct = (value, products) => {
    if (!value) renderProductsOnHTML(products);
    else if (value.length < 3) return;
    const searchedProducts = products.filter(p => p.name.toLowerCase().includes(value));
    renderProductsOnHTML(searchedProducts);
};

/**
 * window on load event listener
 */
window.addEventListener(`load`, async () => {
    // get products
    const products = await getProductsData();
    // render products on html
    renderProductsOnHTML(products);

    // add search event listener
    document.getElementById(`search`).addEventListener(`input`, ({ target }) => onSearchProduct(target.value, products));
    // add filter event listener
});
