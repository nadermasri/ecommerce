from app import db

class Inventory(db.Model):
    __tablename__ = 'inventory'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    location = db.Column(db.String(255), nullable=False)  # e.g., Warehouse A, Store B
    stock_level = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    # Relationship to Product
    product = db.relationship('Product', back_populates='inventory_records')
