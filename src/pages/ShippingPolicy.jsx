import React from "react";
import { Link } from "react-router-dom";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Shipping Policy
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Careful packaging and shipping from the Darjeeling hills
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6 text-organic-text">
              <p className="text-lg leading-relaxed">
                At Darjeeling Souls, we take great care in packaging and shipping your handcrafted items. All our products are sourced directly from artisans in the Darjeeling and Kalimpong regions and shipped from our base in Siliguri.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">📦 Order Processing Time</h3>
                <p className="leading-relaxed">
                  Please allow up to <strong>7 business days</strong> for us to process and dispatch your order. As we work with small-batch producers, this ensures we can perform a final quality check and package your items with care.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">📧 Shipping Confirmation</h3>
                <p className="leading-relaxed">
                  Once your order is dispatched, you will receive a shipping confirmation email containing your tracking number and a link to track your package.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">🚚 Delivery Timelines</h3>
                <p className="leading-relaxed">
                  Delivery times will vary based on your location. You will receive a more accurate delivery estimate at checkout after entering your pincode.
                </p>
              </div>
              
              <div className="bg-organic-background p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">📞 Questions?</h3>
                <p className="leading-relaxed">
                  If you have any questions about your order, please contact us at{" "}
                  <a href="mailto:support@darjeelingsouls.com" className="text-organic-primary underline">
                    support@darjeelingsouls.com
                  </a>
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                to="/contact" 
                className="inline-block bg-organic-primary text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all mr-4"
              >
                Contact Support
              </Link>
              <Link 
                to="/shop" 
                className="inline-block border border-organic-primary text-organic-primary font-bold px-6 py-3 rounded-lg hover:bg-organic-primary hover:text-white transition-all"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}