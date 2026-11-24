# Channel shop — publication sur GitHub Pages

Cette boutique est un site statique : **aucune installation de Node.js n’est nécessaire**. Les commandes et les avis sont envoyés sur WhatsApp au `+224660527599`.

## Mettre le site en ligne

1. Connectez-vous à GitHub et créez un dépôt nommé `channel-shop`.
2. Envoyez dans ce dépôt les dossiers `.github` et `public`, ainsi que ce fichier README.
3. Dans le dépôt, ouvrez **Settings → Pages** et sélectionnez **GitHub Actions** comme source.
4. Ouvrez l’onglet **Actions** et attendez la fin du déploiement « Publier Channel shop sur GitHub Pages ».
5. Ouvrez **Settings → Pages** pour trouver l’adresse publique de la boutique.

Seules les personnes autorisées à modifier le dépôt peuvent publier des changements. Gardez le dépôt et votre compte protégés, et ne partagez pas votre accès GitHub. Le mot de passe fourni précédemment n’est pas utilisé par cette version : un mot de passe placé dans un site statique ne protégerait pas les publications.

## Ajouter un produit avec son prix et sa photo

1. Dans GitHub, ouvrez le dépôt, puis ouvrez `public/images`.
2. Choisissez **Add file → Upload files**, sélectionnez la photo et validez avec **Commit changes**. Utilisez un nom simple sans espace ni accent, par exemple `robe-bleue.jpg`. La photo doit se trouver dans `public/images`.
3. Ouvrez `public/store-data.js`, cliquez sur le crayon **Edit**, puis ajoutez l’objet du produit dans le tableau `products`, avant le crochet fermant `]` :

   ```js
   {
     name: "Robe bleue",
     description: "Belle robe, disponible en plusieurs tailles.",
     price: 12000,
     image: "./images/robe-bleue.jpg"
   }
   ```

4. Séparez cet objet du produit précédent par une virgule. Enregistrez avec **Commit changes**. GitHub mettra la boutique à jour automatiquement.
5. Pour retirer un article, supprimez son objet de `products` et validez le changement.

L’adresse de l’image dans le code doit correspondre exactement à son nom dans `public/images` (respectez majuscules, minuscules et extension). Utilisez des noms simples sans espace ni accent pour éviter les problèmes d’affichage. Vous pouvez aussi utiliser une adresse d’image publique en HTTPS.

## Publier un avis

Les clients remplissent le formulaire de la page, qui prépare un message WhatsApp. Après réception et avec l’accord du client, ajoutez l’avis dans le tableau `reviews` de `public/store-data.js` :

```js
{ name: "Prénom", rating: 5, comment: "Mon avis sur la boutique.", date: "2026-11-23" }
```

Cette modération est nécessaire : GitHub Pages ne permet pas aux visiteurs d’enregistrer directement un avis sur le site.

## WhatsApp

Le numéro WhatsApp `+224660527599` est configuré dans `public/index.html` et `public/app.js`.
