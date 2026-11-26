# Channel shop — publication sur GitHub Pages

Cette boutique est publiée comme site statique : **aucune installation de Node.js n’est nécessaire**. Les commandes et les avis des clients sont envoyés sur WhatsApp au `660527599`. Une fois Supabase configuré, les produits et avis publiés sont gérés en ligne.

## Mettre le site en ligne

1. Connectez-vous à GitHub et créez un dépôt nommé `channel-shop`.
2. Envoyez dans ce dépôt les dossiers `.github` et `public`, ainsi que ce fichier README.
3. Dans le dépôt, ouvrez **Settings → Pages** et sélectionnez **GitHub Actions** comme source.
4. Ouvrez l’onglet **Actions** et attendez la fin du déploiement « Publier Channel shop sur GitHub Pages ».
5. Ouvrez **Settings → Pages** pour trouver l’adresse publique de la boutique.

Le site public reste hébergé sur GitHub Pages. L’espace propriétaire utilise Supabase Auth et des règles Row Level Security en base : le mot de passe n’est jamais écrit dans le code public. Ne publiez jamais une clé `service_role`.

## Activer l’espace propriétaire sécurisé

1. Créez un projet Supabase et ouvrez **SQL Editor**.
2. Copiez le contenu de `supabase/setup.sql` dans une nouvelle requête, puis exécutez-la.
3. Dans **Authentication → Users**, créez l’utilisateur propriétaire avec son adresse e-mail et le mot de passe choisi. Désactivez les inscriptions publiques dans les réglages d’authentification.
4. Copiez l’UUID de cet utilisateur. Dans le SQL Editor, exécutez la requête suivante en remplaçant `UUID_DU_COMPTE` :

   ```sql
   insert into public.store_owners (user_id)
   values ('UUID_DU_COMPTE')
   on conflict (user_id) do nothing;
   ```

5. Dans les réglages API du projet Supabase, copiez l’URL du projet et sa clé publique **anon/publishable**. Renseignez-les dans `public/supabase-config.js` :

   ```js
   window.CHANNEL_SHOP_SUPABASE = {
     url: "URL_DU_PROJET",
     anonKey: "CLE_PUBLIQUE_ANON"
   };
   ```

   La clé publique peut être utilisée dans le site : les règles SQL limitent les modifications au compte propriétaire autorisé. N’utilisez jamais la clé `service_role` dans ce fichier.

6. Publiez les changements sur GitHub. Connectez-vous ensuite depuis **Espace propriétaire** avec l’e-mail et le mot de passe du compte Supabase.

L’espace propriétaire permet d’ajouter, modifier et supprimer les produits et les avis publiés. Les produits et avis sont enregistrés dans Supabase et visibles par les visiteurs. Les demandes d’avis des clients restent envoyées sur WhatsApp pour modération avant publication. Tant que Supabase n’est pas configuré, la boutique affiche les données statiques de `public/store-data.js` et l’espace propriétaire reste désactivé.

## Gérer les produits

Après activation de Supabase, connectez-vous dans **Espace propriétaire** pour ajouter, modifier ou supprimer un produit. La photo doit être accessible par une URL publique HTTPS; vous pouvez téléverser le fichier dans `public` et saisir son URL publique GitHub Pages.

Sans Supabase, les produits peuvent toujours être modifiés dans `public/store-data.js` et publiés avec GitHub.

## Publier un avis

Les clients remplissent le formulaire de la page, qui prépare un message WhatsApp. Après vérification et avec l’accord du client, ajoutez l’avis depuis **Espace propriétaire**. Sans Supabase, les avis peuvent être modifiés dans `public/store-data.js`.

## WhatsApp

Le numéro WhatsApp `660527599` est configuré dans `public/index.html` et `public/app.js`.
