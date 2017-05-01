class Payment {
    constructor() {
        this.token_function = function (token) {
            console.log(token)
        };
        this.pay_obj = {};
    }

    create() {
        var self = this;
        var pay_configure = StripeCheckout.configure({
            key: process.env.STRIPE_PUBLISHABLE_KEY,
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: self.token_function
        });
        $('#pay_btn').click(function (e) {
            pay_configure.open(self.pay_obj);
            e.preventDefault();
        });

        window.addEventListener('popstate', function () {
            pay_configure.close();
        });
    }
}

export default Payment