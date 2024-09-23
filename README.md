# Où sont mes amis ?

[Site web : carte](https://mathis-girault.github.io/friends-map)  
Ce site permet de voir, sur une carte, des positions ajoutées par des personnes.

## Informations 

### Utilisation

Vous disposez à l'écran d'une carte, et de marqueurs qui s'affichent sur la carte.
En haut à gauche un bouton permet d'ouvrir un formulaire pour ajouter une nouvelle adresse, comportant un nom, et une adresse postale. Si l'adresse postale est déclarée comme en France, des suggestions d'adresses apparaissent à l'écran (issues de l'API du gouvernement).

Sur la carte, vous pouvez cliquer sur un marqueur pour voir quels noms sont liés à ce lieu (les personnes ayant ajoutées cette adresse).

### Données

Les marqueurs ajoutés sont stockées dans une base de donnée qui recensie tous les marqueurs ayant étés ajoutés.
Cette base de données déployée est stockée sur Firebase.
Les données ne sont en aucun cas utilisées à des fins commerciales, mais sont accessibles par tout le monde.
Pour retirer vos données il vous faut me contacter.  

### Ameiliorations

Ce site a été codé en quelques heures hésitez pas a proposer des modifications ou me dire ce qui ne va pas.

### Licence

C'est sous licence GNU, si vous voulez vous pouvez tout a fait copier tout le projet pour faire le même avec tes potes, il faudra juste prendre votre propre base de donnée.

## Caractéristiques techniques

### Branches

Le site est deployé automatiquement à partir de la branch `deploy`, celle-ci contient donc uniquement le site buildé.
Le code compilé est push sur la branch `deploy` automatiquement dans les actions GitHub.
La branch principale de developpement est `dev`.

### Stack

Ce site est développé avec Angular.
