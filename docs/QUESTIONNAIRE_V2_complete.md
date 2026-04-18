# Questionnaire de lancement — Volta Drinks (v2)

**45 questions pour finaliser le site.** Version 2 du questionnaire initial : ajout d'une section intégration technique et étiquettes d'engagement sur chaque question.

---

## Comment répondre

Ce document contient **45 questions organisées en 11 thèmes**. Chaque question a un espace de réponse.

Chaque question a deux étiquettes :

| Tag | Sens |
|---|---|
| `INFO` | Tu partages une information que tu as déjà (hex, handle, fichier, liste) |
| `DÉCISION` | Tu choisis entre plusieurs options ou confirmes un défaut que je te propose |
| `ACTION` | Tu dois faire quelque chose en externe (KYC, engager un prestataire, acheter un domaine, contacter un comptable). Ces questions ont des **délais de livraison réels** — anticipe |
| `CRITIQUE` | Bloquant pour le lancement. Ne publie pas le site sans ça résolu |

Le conseil reste le même : **ne bloque pas sur une question.** Si tu ne sais pas, écris « à valider » et on en reparlera. Mieux vaut 40 réponses rapides et 5 à clarifier que d'attendre d'avoir tout parfait.

**Lecture rapide :** les questions `ACTION` demandent le plus de temps réel (jours à semaines). Identifie-les d'abord, lance-les en parallèle, et reviens faire les `INFO` et `DÉCISION` à tête reposée.

---

## 01 Marque & identité

*Identité visuelle : couleurs, finition du mascot, ton.*

### 01. Code hex exact de ton vert de marque ? `INFO · CRITIQUE`

Le logo donne approximativement `#4ADE80` (j'utilise `#7FEFA8` depuis ton logo v2 mais à l'œil). Si tu as une charte graphique ou le fichier Illustrator original, j'ai besoin du hex précis, Pantone ou CMJN.

**Réponse :**

### 02. Le mascot (l'éclair) est-il final ? `DÉCISION`

Options :
- **(a)** Garder le mascot actuel tel quel
- **(b)** Le faire affiner par un illustrateur (~500–2000 €, mascot sheet multi-poses)
- **(c)** Générer des variantes IA (rapide, moins de contrôle)

**Réponse :**

### 03. As-tu d'autres assets visuels à m'envoyer ? `INFO`

Photos produit, vidéos, illustrations, motifs, icônes ? Envoie-moi tout ce que tu as déjà, même brouillon.

**Réponse :**

### 04. Tutoiement ou vouvoiement ? `DÉCISION`

Je pars sur le **tu** (plus proche, plus joueur, cohérent avec le mascot). Confirme ou corrige.

**Réponse :**

### 05. Slogan officiel ? `DÉCISION`

Placeholder : « Charge ton jus » — que tu n'aimes pas. Tu veux que je te propose 3-5 alternatives, ou tu as quelque chose d'officiel ?

**Réponse :**

---

## 02 Gamme produit

*Catalogue, prix, page produit.*

### 06. Noms finaux et composition de chaque saveur ? `INFO · CRITIQUE`

Mes placeholders :
- Ginger Classic (gingembre / ananas / citron — le flagship)
- Citrus Storm (???)
- Tropical Jolt (???)
- Deep Root (???)

Vrais noms et compositions détaillées (avec pourcentages si possible) ?

**Réponse :**

### 07. Prix finaux ? `DÉCISION · CRITIQUE`

Confirmés :
- Unité : 3 € ✓
- Pack de 6 : 15 € (2,50 €/unité, -17%) ✓
- Pack de 12 : ___ € (je suggère 27-28 €)
- Pack Mixte (abonnement uniquement) : ___ €/mois (je suggère 30 € → ~21 €/mois après -30%)

Prix verrouillés, ou tu veux une analyse de positionnement vs concurrents (3,50-5 €/unité en France) ?

**Réponse :**

### 08. Composition du Pack Mixte ? `DÉCISION`

12 shots mixés — 3 de chaque (si 4 saveurs) ? Le client choisit le mélange, ou c'est curaté par toi ?

**Réponse :**

### 09. Seuil de livraison gratuite ? `DÉCISION`

Placeholder : 25 €. À fixer en fonction de ton coût moyen d'expédition.

**Réponse :**

---

## 03 Abonnement

*Règles techniques de l'abonnement — 60-70% du revenu long-terme passe par là.*

### 10. Fréquence d'abonnement ? `DÉCISION`

Mensuel confirmé. Veux-tu aussi proposer bi-mensuel (toutes les 2 semaines) pour les gros consommateurs (1 shot/jour) ?

**Réponse :**

### 11. Portée de la remise -30% ? `DÉCISION`

La remise s'applique à :
- **(a)** Abonnement au shot unique uniquement
- **(b)** Tous les formats en abonnement (unité, 6, 12, mixte) — mon défaut
- **(c)** Uniquement le Pack Mixte

**Réponse :**

### 12. Règles de pause / saut / annulation ? `DÉCISION`

Défaut (ce que Seal supporte nativement) :
- Pause à tout moment (jusqu'à 3 mois)
- Saut de livraison à tout moment
- Changement de saveurs avant la prochaine facturation
- Annulation à tout moment, sans frais

Si tu veux ajouter de la friction, je te déconseille — ça fait plus mal à la conversion que de bien à la rétention.

**Réponse :**

---

## 04 Logistique & opérations

*Détermine les mentions sur le site. Ne promets rien que tu ne peux pas tenir.*

### 13. D'où expédies-tu ? `INFO · CRITIQUE`

Adresse de fulfillment — détermine zones de livraison, tarifs, délais.

**Réponse :**

### 14. Fulfillment en interne ou 3PL ? `INFO`

Affecte les SLA et la promesse « Livraison 48h » sur la page produit. Ne fais pas cette promesse si tu ne peux pas la tenir.

**Réponse :**

### 15. Durée de conservation des shots ? `INFO · CRITIQUE`

Un pack de 12 tient 30 jours à température ambiante, ou a besoin d'être réfrigéré ? Ça change tout le discours de vente de l'abonnement et la faisabilité du wholesale.

**Réponse :**

### 16. Transporteur(s) ? `DÉCISION`

Colissimo, Chronopost, DHL, Mondial Relay ? Détermine les tarifs affichés et l'intégration du suivi.

**Réponse :**

---

## 05 Légal & conformité

*Section critique. Décide si on peut publier le site le jour J ou pas. **La plupart des questions ici sont `ACTION` — délais réels de 2 semaines à 6 mois.***

### 17. Dépôt de la marque « Volta Drinks » en France/UE ? `ACTION · CRITIQUE`

Si non, **à lancer cette semaine.** Il y a un concurrent américain (drinkvolta.com) qui opère sur le même nom.
- Budget : ~1 800-2 500 € pour un dépôt EUIPO en 3 classes
- Délai : 2-3 semaines dépôt, 4-6 mois enregistrement final

**Réponse :**

### 18. Consultant HACCP engagé ? `ACTION · CRITIQUE`

Obligatoire pour la production de boissons en France. Déclaration DDPP à faire en parallèle. Sans ça, tu ne peux légalement pas mettre les produits sur le marché.

**Réponse :**

### 19. CGV, mentions légales, politique de confidentialité — qui rédige ? `ACTION`

Conformes au Code de la consommation et au RGPD. **N'utilise pas de sorties ChatGPT.**
- Legalstart ou Captain Contrat : 100-800 €
- Avocat : 500-1500 € (one-shot)

**Réponse :**

### 20. Allégations nutritionnelles ? `INFO · CRITIQUE`

« Fonctionnel » est marketing ; « booste l'énergie » est réglementé (UE 1924/2006). Dis-moi les claims que tu veux sur le packaging et le site — je te marquerai celles qui ne passent pas.

**Réponse :**

### 21. Déclarations d'allergènes ? `INFO · CRITIQUE`

Liste des ingrédients + allergènes à afficher sur chaque fiche produit (UE 1169/2011). J'ai besoin de la liste exacte par saveur.

**Réponse :**

---

## 06 Marketing & données

*Pour câbler le site aux outils de suivi et aux campagnes.*

### 22. Handles réseaux sociaux existants ? `INFO`

Instagram, TikTok, YouTube, Pinterest ? Je les mets en pied de page.

**Réponse :**

### 23. Outil d'emailing ? `DÉCISION`

Klaviyo, Brevo, Mailchimp ? Je recommande **Klaviyo** — intégration Shopify native, gratuit jusqu'à 250 contacts.

**Réponse :**

### 24. Campagnes payantes au lancement ? `DÉCISION`

Meta Ads, Google Ads, TikTok Ads ? Change la config du pixel et la priorité des landing pages.

**Réponse :**

### 25. Clients pré-existants ou waitlist ? `INFO`

Si oui, on met en place une offre « clients fondateurs » pour le lancement.

**Réponse :**

### 26. Stratégie d'avis clients ? `DÉCISION`

Judge.me (gratuit), Loox (photos, payant), Yotpo (enterprise) ? Je recommande **Judge.me** pour le lancement.

**Réponse :**

---

## 07 Références design

*Pour caler mon radar sur ton goût.*

### 27. 3 à 5 sites que tu aimes ? `INFO`

Pas les concurrents directs — sites dont le vibe / motion / ton te parlent. Awwwards SOTY bienvenu.

**Réponse :**

### 28. 3 à 5 sites que tu détestes ? `INFO`

Savoir ce qu'il faut éviter est aussi utile que savoir ce qu'il faut viser.

**Réponse :**

---

## 08 Logistique du projet

*Pour caler le rythme de livraison.*

### 29. Date cible de lancement ? `DÉCISION · CRITIQUE`

Définit le rythme du build et ce qu'on coupe en v1. Mieux vaut un site propre en retard qu'un site bancal à temps.

**Réponse :**

### 30. Budget pour les assets premium ? `DÉCISION`

Pour atteindre un niveau Awwwards :
- Animation mascot Lottie (freelance animateur) : 300-800 €
- Shooting photo produit professionnel : 500-1500 €
- Audio / sound design (optionnel) : 50-100 €

On peut éviter tout ça avec des placeholders — mais la qualité finale en pâtit, surtout le mascot qui est LE différenciant de ta marque.

**Réponse :**

---

## 09 Shopify & intégration technique

*Nouveau — v2. Ces credentials me débloquent pour pousser le thème sur ta boutique et tester en conditions réelles.*

### 31. Handle + plan Shopify ? `DÉCISION · CRITIQUE`

Le placeholder `volta-drinks.myshopify.com` renvoie un 404. Trois scénarios :
- **(a)** Boutique déjà créée sous un autre handle → donne-le
- **(b)** Pas de boutique, budget serré → dev store Shopify Partners (gratuit, complet)
- **(c)** Pas de boutique, prêt à payer → Shopify Basic (27 €/mois)

**Réponse :**

### 32. Accès collaborateur / staff pour moi ? `ACTION · CRITIQUE`

Pour pousser le thème, j'ai besoin d'un accès collaborateur avec droits « Thèmes ». À créer depuis :
**Admin → Paramètres → Utilisateurs et autorisations → Collaborateurs → Ajouter**

Puis transmets-moi le code d'invitation à 4 chiffres.

**Réponse :**

### 33. Moyens de paiement + onboarding Shopify Payments ? `ACTION · CRITIQUE`

À activer :
- Carte bancaire via Shopify Payments (KYC : SIRET + CNI dirigeant + RIB pro)
- Apple Pay / Google Pay (auto avec Shopify Payments)
- PayPal (compte Business requis)
- SEPA (tardif, optionnel)

**Le KYC Shopify Payments prend 2-5 jours ouvrés.** À lancer maintenant si le lancement est serré.

**Réponse :**

### 34. App de consentement cookies ? `DÉCISION`

Bandeau obligatoire en UE avant tracking. Options :
- **(a)** Shopify Customer Privacy API (natif, gratuit, minimal) — mon défaut
- **(b)** Consentmo (freemium, 50-90 €/an)
- **(c)** Osano (premium, ~100 €/mois)

**Réponse :**

### 35. IDs de tracking ? `INFO`

Pas bloquant pour le dev. À renseigner dans l'admin Shopify (Volta · Analytics) quand disponibles :
- ID GTM (`GTM-XXXXXXX`)
- ID Meta Pixel
- Clé publique Klaviyo
- ID GA4 (`G-XXXXXXXXXX`, configuré via GTM)

**Réponse :**

---

## 10 Domaine, social & assets techniques manquants

*Nouveau — v2. Urgent : sécuriser l'identité en ligne avant que le concurrent ne prenne le reste.*

### 36. Domaines et handles sociaux sécurisés ? `ACTION · CRITIQUE`

- Domaines à acheter cette semaine : `voltadrinks.fr`, `voltadrinks.com` (10-15 € l'unité, Gandi / OVH)
- Handles à réserver : @voltadrinks sur Instagram, TikTok, YouTube, Pinterest

Ton concurrent américain a déjà `drinkvolta.com`. Assure-toi au minimum du `.fr` et du `.com` de ton côté avant le dépôt EUIPO.

**Réponse :**

### 37. Modèle 3D de la bouteille — format exportable ? `ACTION`

Tu m'as envoyé des fichiers SolidWorks (`.SLDPRT`, `.SLDASM`) — format propriétaire, je ne peux pas les lire. J'ai besoin d'un export :
- **GLB / glTF** (idéal, Three.js direct)
- **STEP** (Blender → re-render + GLB)
- **STL** (fallback)

Options pour convertir : Onshape (navigateur, 3 min), Fusion 360 (gratuit usage perso), ton prestataire mécanique.

**Réponse :**

### 38. Étiquettes finales par saveur ? `DÉCISION`

Pour le rendu photo et le site, j'ai besoin d'étiquettes PNG haute résolution (2048×2048, fond transparent). Options :
- **(a)** Graphiste engagé (~200-500 € pour 4 étiquettes)
- **(b)** Placeholders crème vierges au lancement, update en phase 2
- **(c)** Tu les fais toi-même (Figma, Illustrator)

**Réponse :**

### 39. Shooting photo produit pro — planifié ? `ACTION`

Pas bloquant (le rendu Nano Banana tient la route en hero) mais nécessaire pour cartes produit, lifestyle, réseaux. Budget 500-1500 € / demi-journée Paris. Délai brief-livraison : 2-3 semaines.

**Réponse :**

---

## 11 Administratif, fiscal & pré-lancement

*Nouveau — v2. Le fiscal débloque Shopify Payments. Le pré-lancement décide si tu as 0 ou 15 avis le jour J.*

### 40. Taux TVA confirmé avec ton comptable ? `ACTION · CRITIQUE`

Les shots fonctionnels peuvent tomber en :
- 5,5 % (denrées de base — peu probable)
- 10 % (consommation immédiate — plausible)
- 20 % (boissons non alcoolisées — défaut prudent)

**Fais valider par ton comptable.** Une erreur rattrapée sur 6 mois de ventes, c'est douloureux.

**Réponse :**

### 41. SIRET, RCS, numéro TVA intracommunautaire ? `INFO`

Nécessaires pour : mentions légales, activation Shopify Payments, facturation B2B.

**Réponse :**

### 42. Compte bancaire professionnel prêt ? `ACTION`

Exigé par Shopify Payments — **au nom de la société**, pas un compte perso.
- Qonto : 2-5 jours, ~9 €/mois
- Shine : 2-3 jours, ~8 €/mois
- Revolut Business : 24-48h, gratuit basique
- Banque traditionnelle : 2-4 semaines

**Réponse :**

### 43. Zone de livraison au lancement ? `DÉCISION`

- **(a)** France métropolitaine seulement — simple, TVA unique, ma recommandation v1
- **(b)** France + UE — TVA à destination (OSS), logistique par pays
- **(c)** France + UE + UK — formalités douanières post-Brexit (coûteux petit colis)
- **(d)** US — pas avant 2-3 ans (licences FDA)

**Réponse :**

### 44. Beta testers pour premiers avis ? `ACTION`

Pour éviter une boutique à zéro avis le jour J : 20-30 packs gratuits envoyés à amis / famille / early supporters, demande d'avis + photo une semaine après. Résultat : 10-15 avis vérifiés au lancement.

**Combien de packs peux-tu offrir, et à qui ?**

**Réponse :**

### 45. Plan de seeding influenceurs ? `DÉCISION`

Si push via créateurs lifestyle / wellness :
- Budget par envoi (~40 € produit + frais + packaging premium)
- Influenceurs déjà en contact ?
- Date cible unboxings (idéalement 1-2 semaines avant le lancement)

**Réponse :**

---

## Récap — ce qu'il faut lancer d'abord

Si tu ne fais que 5 choses cette semaine :

| Priorité | Question | Tag | Pourquoi maintenant |
|---|---|---|---|
| 1 | **Q36** Domaines + handles | `ACTION · CRITIQUE` | Ton concurrent existe. Chaque jour d'attente = risque |
| 2 | **Q31** Handle Shopify + plan | `DÉCISION · CRITIQUE` | Rien ne peut se tester sans boutique |
| 3 | **Q33** Shopify Payments KYC | `ACTION · CRITIQUE` | 2-5 jours de validation externe |
| 4 | **Q17** Dépôt EUIPO | `ACTION · CRITIQUE` | 2-3 semaines dépôt, urgence trademark |
| 5 | **Q40** TVA avec comptable | `ACTION · CRITIQUE` | Bloque les prix affichés et Shopify Payments |

Le reste peut arriver au fil de l'eau. Une fois ces 5 cases cochées, je débloque 80 % du reste du travail en parallèle.

---

*Questionnaire préparé par Théo pour Volta Drinks, avril 2026 — v2 du 17/04.*
*Les recommandations techniques, tarifaires et juridiques restent des estimations indicatives et ne remplacent pas les avis de professionnels qualifiés.*
