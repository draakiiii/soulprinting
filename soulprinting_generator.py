import json

# Ruta al archivo JSON existente
filename = "products.json"

# Cargar el archivo JSON existente
try:
    with open(filename, "r", encoding="utf-8") as file:
        products = json.load(file)
except FileNotFoundError:
    products = []  # Si no existe, crear una lista vacía

# Solicitar los datos del nuevo producto
name = input("Introduce el nombre del producto: ")
default_image = input("Introduce la URL de la imagen por defecto: ")
hover_image = input("Introduce la URL de la imagen al pasar el ratón: ")

options = []
while True:
    height = input("Introduce la altura del producto (deja vacío para terminar): ")
    if not height:
        break
    price = input("Introduce el precio del producto: ")
    options.append({"height": f"{height}cm", "price": price})

# Crear el nuevo producto
new_product = {
    "defaultImage": default_image,
    "hoverImage": hover_image,
    "name": name,
    "options": options
}

# Añadir el nuevo producto a la lista existente
products.append(new_product)

# Guardar los cambios en el archivo JSON
with open(filename, "w", encoding="utf-8") as file:
    json.dump(products, file, indent=2, ensure_ascii=False)

print("Producto añadido correctamente.")
