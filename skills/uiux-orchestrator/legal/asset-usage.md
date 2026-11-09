# Reusing specialist assets

Read this before copying a specialist's photos, icons, fonts, maps, templates or code into a
product. Installing a skill does not make all of its contents MIT-licensed. Read the selected
asset's original credits and terms; the upstream root licence may cover only original work.

## Keep an asset record with the product

For each reused asset, record its product path, original creator, original source URL, exact
licence/version and licence URL, any supplied copyright/attribution notices, and changes made.
Preserve supplied disclaimers and earlier modification notices. Carry required full permission
notices into the product's distributed notices; a source link or an SPDX label alone may not suffice.

For Taste, retain the relevant entries from `assets/photos/photos.json`,
`assets/icons/demo/icons-credits.json`, `assets/ui/icons/icons-credits.json`, and the
`credits.json` files beside layout, scene and moment photos. These are upstream attribution
records, not proof of every contributor's ownership. Check the actual asset's original page
before shipping it. Missing, ambiguous or conflicting provenance means use a verified replacement
or obtain permission; do not invent a copyright holder or a licence grant.

## Apply the asset's terms

| Material | What to preserve or check when reusing it |
|---|---|
| MIT / ISC code and icons | Original copyright and full permission/disclaimer notices. Supplementary originals are in `.uiux-licenses/supplemental/licenses/` for installed specialists, or this skill's `legal/licenses/`. Lucide's file includes the MIT notice for Feather-derived icons; keep both where applicable. |
| Apache-2.0 material | Full licence and relevant NOTICE/attribution; prominently mark files you modify. |
| CC BY photos | Credit, original source and exact licence link; retain supplied notices and identify changes as that version requires. |
| CC BY-SA photos | The attribution above plus the applicable ShareAlike terms when sharing an adaptation. Do not label an adapted CC BY-SA image as MIT. This does not automatically relicense unrelated application code. Check the actual version, including jurisdiction-specific variants. |
| CC0 / public-domain-labelled assets | Retain available provenance. CC0 and Public Domain Mark are different instruments; neither clears unrelated trademark, privacy or publicity rights. |
| Unsplash / Pexels photos | Follow the photo provider's actual terms; neither provider's licence is MIT. Check restrictions on unaltered resale, competing image libraries and implied endorsement, as applicable. |

An attribution entry can look like:

```text
assets/hero.webp — [original creator]; [original image page]; [exact licence and URL].
Changes: cropped and colour-graded by [actual editor].
```

Replace the brackets with verified facts. For image licences requiring public attribution,
make the credits reasonably accessible in the shipped UI or other appropriate medium; a hidden
build-time JSON file alone may not satisfy that condition. A licence that requires full notices
also needs the actual notice text, beyond this example.

## Optional resources and brand marks

- Logo artwork can carry trademark restrictions even when its copyright licence is CC0.
  Use it only in an appropriate brand context; never imply sponsorship or replace the product's
  own identity with another company's mark without the necessary rights.
- Taste's map generator can fetch OpenStreetMap data. If used, follow the current
  [OSM attribution and ODbL requirements](https://www.openstreetmap.org/copyright), including
  attribution placement for the actual map format and any database obligations. Upstream styling
  preferences do not override those requirements.
- Remote fonts, runtime libraries and downloaded assets retain their own terms. If self-hosting
  font files, obtain and ship each font's actual licence; do not assume that a skill's MIT licence
  covers them. Merely installing this catalogue does not download fonts or map data.

The installer preserves reviewed notices and credit manifests. It does not grant rights in
unknown copied material, validate every asset's origin, or clear trademarks and likenesses.

Primary terms: [MIT](https://opensource.org/license/mit),
[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0),
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en),
[Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/).
