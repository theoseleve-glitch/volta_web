# Questionnaire Volta Drinks — Additions v2

**Complément aux 30 questions originales.** 15 questions supplémentaires, 3 nouvelles sections, réparties d'après ce qui s'est avéré bloquant ou manquant pendant la phase build. À merger dans le PDF existant après la section 08.

---

## 09 Shopify & intégration technique

*Section entièrement nouvelle. Ces réponses me débloquent pour pousser le thème sur ta boutique et tester en conditions réelles. Sans ces credentials, je reste sur un preview statique local.*

### 31. Quel est le handle de ta boutique Shopify ? CRITIQUE

J'ai besoin du sous-domaine `xxx.myshopify.com`. Le placeholder `volta-drinks.myshopify.com` renvoie un 404 — il n'existe pas. Trois scénarios :

- **(a)** La boutique existe déjà sous un autre handle → donne-le-moi
- **(b)** Pas encore de boutique, budget serré → on ouvre un **dev store** via Shopify Partners (gratuit, toutes les fonctionnalités, pas d'essai limité dans le temps) pour tester avant de basculer sur un plan payant
- **(c)** Pas encore de boutique, prêt à payer → on démarre direct sur **Shopify Basic** (27 €/mois, essai gratuit 3 jours)

### 32. Peux-tu me donner un accès collaborateur à la boutique ? CRITIQUE

Pour pousser le thème (`shopify theme push --unpublished`) et tester en conditions réelles, j'ai besoin d'un accès **collaborateur** (ou staff avec droits "Thèmes"). Tu peux créer l'invitation depuis :
**Admin Shopify → Paramètres → Utilisateurs et autorisations → Collaborateurs → Ajouter**

Puis me transmets le code d'invitation à 4 chiffres. Je me connecte avec mon compte Partners.

### 33. Moyens de paiement + onboarding Shopify Payments ? CRITIQUE

Confirme les moyens de paiement à activer :

- **Carte bancaire via Shopify Payments** (nécessite KYC complet : SIRET, CNI dirigeant, RIB pro)
- **Apple Pay / Google Pay** (activé automatiquement avec Shopify Payments)
- **PayPal** (compte PayPal Business requis)
- **SEPA / virement** (ajout tardif possible)

Le **KYC Shopify Payments prend 2-5 jours ouvrés**. Si ton lancement est serré, ça vaut la peine de démarrer l'onboarding maintenant, même avant que la boutique ne soit publique.

### 34. App de consentement cookies ?

L'UE impose un bandeau de consentement avant tout tracking (GTM, Meta Pixel, Klaviyo). Options :

- **Shopify Customer Privacy API** (natif, gratuit, minimal mais conforme) — mon défaut
- **Consentmo** (freemium, ~50-90 €/an, UI plus finie)
- **Osano** (premium, ~100 €/mois, pour enseignes plus grosses)

Je recommande Shopify Customer Privacy API au lancement pour rester léger.

### 35. IDs de tracking (quand disponibles)

Pas bloquant pour le dev mais nécessaire au lancement. Tu peux les renseigner au fur et à mesure dans l'admin Shopify sous « Volta · Analytics » :

- **ID GTM** (format `GTM-XXXXXXX`)
- **ID Meta Pixel** (format numérique 15-16 chiffres)
- **Clé publique Klaviyo** (6 caractères alphanumériques)
- **ID propriété GA4** (format `G-XXXXXXXXXX`) — configuré dans GTM, pas directement dans le thème

Si tu n'as aucun de ces comptes ouverts, crée-les dans cet ordre : GTM → GA4 (via GTM) → Meta Business Manager → Klaviyo.

---

## 10 Domaine, social & assets techniques manquants

*Nouvelle section. Plusieurs de ces points sont urgents indépendamment du site — notamment la sécurisation du domaine et des handles face à ton concurrent américain.*

### 36. Domaine(s) acheté(s) et handles sociaux réservés ? CRITIQUE

- Quels domaines as-tu acheté ou réservé ? (priorité : `voltadrinks.fr`, `voltadrinks.com`, secondaire : `.eu`, `.shop`, `.drinks`)
- Handles sociaux déjà pris ? **Instagram, TikTok, YouTube, Pinterest** — même si tu ne comptes pas publier tout de suite, réserve-les maintenant

**Urgence :** ton concurrent `drinkvolta.com` existe déjà. Si tu n'as pas encore `voltadrinks.com` et `voltadrinks.fr`, achète-les ce weekend — 10-15 € l'unité chez Gandi ou OVH. C'est la première chose à cocher avant le dépôt EUIPO.

### 37. Modèle 3D de la bouteille — format exportable ?

Tu m'as envoyé trois fichiers SolidWorks (`.SLDPRT`, `.SLDASM`). Je ne peux pas les ouvrir directement (format propriétaire). Pour les intégrations web (hero 3D Three.js, renders Blender, référence pour Nano Banana img2img), j'ai besoin d'un export :

- **GLB / glTF** (idéal — web-friendly, chargeable directement dans Three.js)
- **STEP** (utilisable dans Blender → re-render + export GLB)
- **STL** (fallback — moins de détails mais convertissable)

Options pour convertir sans SolidWorks :

- **Onshape** (navigateur, gratuit, 3 min) — Import SLDPRT → Export glTF
- **Autodesk Fusion 360** (gratuit usage perso, install local, ouvre SolidWorks nativement)
- Directement ton prestataire / ingénieur qui a modélisé la bouteille (le plus rapide)

### 38. Étiquettes finales par saveur ?

Pour le rendu photo hero (Nano Banana) et les cartes produit, j'ai besoin des étiquettes en PNG haute résolution — idéalement 2048×2048, fond transparent.

Une étiquette par saveur. Qui dessine ?

- **(a)** Graphiste engagé (budget ~200-500 € pour les 4 saveurs)
- **(b)** Reste en placeholder crème vierge au lancement, update en phase 2 quand la marque stabilise les noms
- **(c)** Tu les fais toi-même en Figma / Illustrator

Option (b) est acceptable pour un lancement rapide — le rendu Nano Banana tient la route avec des étiquettes neutres.

### 39. Shooting photo produit pro — date de livraison ?

Pas bloquant pour le build (on a un rendu Nano Banana correct pour le hero), mais nécessaire avant le lancement pour :

- Cartes produit individuelles (4 visuels cohérents)
- Lifestyle pour la page "Notre Histoire"
- Réseaux sociaux + ads
- Réutilisation multi-saisons (versions d'automne, d'été...)

Budget : **500-1500 €** pour une demi-journée avec un photographe produit sur Paris. Délai : compter 2-3 semaines entre briefing et livraison.

---

## 11 Administratif, fiscal & pré-lancement

*Nouvelle section. Les questions fiscales sont bloquantes pour ouvrir Shopify Payments et afficher des prix corrects. Le pré-lancement est ce qui décide si ta boutique a 0 avis le jour J ou 15.*

### 40. Taux TVA confirmé avec ton comptable ? CRITIQUE

Les shots fonctionnels peuvent tomber dans plusieurs catégories TVA :

- **5,5 %** (denrées alimentaires de base, peu probable pour un shot "fonctionnel")
- **10 %** (produits alimentaires à consommation immédiate — plus plausible)
- **20 %** (boissons non alcoolisées standard — défaut de prudence)

Chaque produit fonctionnel est un cas particulier selon la composition et le positionnement marketing. **Fais valider par ton comptable avant le lancement.** Une erreur de TVA à rattraper sur 6 mois de ventes, c'est douloureux.

### 41. SIRET, RCS et numéro de TVA intracommunautaire ?

Nécessaires pour :

- Mentions légales du site
- Activation de Shopify Payments (question 33)
- Facturation B2B si tu ouvres le wholesale
- Déclarations de TVA trimestrielles/mensuelles

### 42. Compte bancaire professionnel prêt ?

Shopify Payments et Stripe exigent un compte bancaire **au nom de la société**, pas un compte courant perso. Options rapides :

- **Qonto** (2-5 jours, ~9 €/mois, très bien pour DTC)
- **Shine** (2-3 jours, ~8 €/mois)
- **Revolut Business** (24-48h, gratuit basique)
- Banque traditionnelle (compter 2-4 semaines)

### 43. Zone de livraison au lancement ?

Choix structurant pour la TVA, la logistique et les mentions légales :

- **(a)** France métropolitaine seulement → simple, TVA unique, zone unique
- **(b)** France + UE → TVA à destination (régime OSS), accords logistiques par pays
- **(c)** France + UE + UK → formalités douanières post-Brexit (⚠️ coûteux pour un colis unitaire à 3-30 €)
- **(d)** Ambitions US → pas avant 2-3 ans sauf stratégie claire (licences FDA, classification beverage complexe)

Je recommande **(a) au lancement**, ouvrir l'UE au mois 3-6 une fois la logistique FR stabilisée.

### 44. Liste de beta testers / premiers avis ?

Pour éviter la boutique vide avec zéro avis le jour du lancement, offre **20-30 packs gratuits** à :

- Amis et famille (pour retour honnête)
- Early supporters / waitlist si tu en as une
- Micro-influenceurs locaux (10k-50k abonnés, engagement fort) — envoi gratuit contre story honnête

Demande un avis écrit + une photo une semaine après réception. Résultat : 10-15 avis vérifiés + 5-10 stories au lancement, vs 0 sinon.

**Combien de packs peux-tu offrir et à qui ?**

### 45. Plan de seeding influenceurs au lancement ?

Si tu veux pousser via créateurs lifestyle / wellness France :

- Budget seeding (envoi produit gratuit — compter ~40 € par envoi avec produit + frais + packaging premium)
- Liste d'influenceurs déjà en contact ?
- Plateforme de gestion (Upfluence, Heepsy, ou direct DM) ?
- Date cible pour les premiers unboxings (idéalement 1-2 semaines avant le lancement)

Pas bloquant, mais multiplie les résultats du lancement si bien orchestré.

---

## Récap priorités (CRITIQUE pour débloquer le dev)

Si tu ne dois répondre qu'à 5 questions maintenant, c'est celles-ci :

1. **Q31** — Handle Shopify (ou décision dev store vs plan payant)
2. **Q32** — Accès collaborateur
3. **Q33** — Onboarding Shopify Payments démarré
4. **Q40** — TVA validée avec comptable
5. **Q36** — Domaines et handles réservés

Les autres peuvent arriver au fil de l'eau. Le reste de l'équipe peut travailler en parallèle sur les assets (Q37-39) et le pré-lancement (Q44-45).

---

*Document préparé par Théo pour Volta Drinks, avril 2026. Complément à la v1 du questionnaire (30 questions). Les recommandations techniques, tarifaires et juridiques restent des estimations indicatives.*
