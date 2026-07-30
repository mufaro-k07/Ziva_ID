# Multilingual Form Labels — ZivaID v1.0

## 1. The SRS requirement

ZivaID must display relevant form labels or short instructions in Zimbabwe's three
main languages — **English, Shona (chiShona), and Ndebele (isiNdebele)** — shown
together where appropriate, particularly on forms.

The SRS gives one worked example:

> Name / Zita / Ibizo

## 2. Scope of Version 1.0

**In scope**

- Citizen registration form
- Citizen intake form (both Birth Certificate and National ID)
- Admin-assisted walk-in intake form (citizen-entered fields only)
- Section headings and short instructions on those forms

**Out of scope**

- Citizen login (deliberately skipped — see §9)
- Officer-facing UI: review queue, record inspection, audit log, officer session
- Long guidance paragraphs — English remains primary for these in v1.0
- Checklist document descriptions — see §6

## 3. There is no language switcher

This is **not** an internationalisation system. All three languages render
simultaneously, with English visually primary. No i18n library was installed —
no `i18next`, no `react-i18next`, no translation API, no language detection.
The implementation is a plain object literal and one presentational component.

## 4. Architecture

| File | Role |
|---|---|
| `client/src/constants/multilingualLabels.js` | Single source of truth — `{ en, sn, nd }` per key |
| `client/src/components/MultilingualLabel.jsx` | Renders primary + secondary lines |
| `client/src/index.css` | ~30 lines of styling, global so no page needs a new import |

Language codes: `en` English · `sn` Shona · `nd` Ndebele.

The citizen intake form and the admin-assisted form **share the same label
definitions**, so there is no second, divergent translation list.

## 5. Glossary

Confidence key — **Confirmed**: established by the SRS · **High**: standard,
confident usage · **Medium**: plausible standard usage, review advised ·
**Review**: not confirmed, native-speaker verification required.

| Key | English | Shona (sn) | Ndebele (nd) | Confidence |
|---|---|---|---|---|
| `name` | Name | Zita | Ibizo | **Confirmed** (SRS) |
| `fullName` | Full name | Zita rakazara | Ibizo eligcweleyo | Medium |
| `fullLegalName` | Full legal name | Zita rakazara rapamutemo | Ibizo eligcweleyo elisemthethweni | Review |
| `dateOfBirth` | Date of birth | Zuva rekuzvarwa | Usuku lokuzalwa | High |
| `gender` | Gender | Murume kana mukadzi | Ubulili | Medium |
| `male` | Male | Murume | Owesilisa | High |
| `female` | Female | Mukadzi | Owesifazana | High |
| `emailAddress` | Email address | Kero yeemail | Ikheli le-imeyili | Medium |
| `password` | Password | Pasiwedhi | Iphasiwedi | Review |
| `createPassword` | Create password | Gadzira pasiwedhi | Yenza iphasiwedi | Review |
| `nationalIdNumber` | National ID number | Nhamba yechitupa | Inombolo yesitupa | High (sn) / Approved (nd) |
| `birthCertificateEntryNumber` | Birth certificate entry number | Nhamba yegwaro rekuzvarwa | Inombolo yesitifiketi sokuzalwa | Medium |
| `districtOfRegistration` | District of registration | Dunhu rekunyoreswa | Isigaba sokubhalisa | Review |
| `districtOrProvince` | District / registry province | Dunhu kana provhinzi | Isigaba loba isifundazwe | Review |
| `placeOfOrigin` | Place of origin | Nzvimbo yaunobva | Indawo elivela kuyo | Medium |
| `hospitalOfBirth` | Hospital / clinic of birth | Chipatara kana kiriniki yekuzvarirwa | Isibhedlela loba umtholampilo wokuzalwa | Medium (sn) / Review (nd) |
| `residentialAddress` | Residential address | Kero yekugara | Ikheli lokuhlala | Medium |
| `motherFullName` | Mother's full name | Zita rakazara ramai | Ibizo eligcweleyo likamama | Medium |
| `motherMaidenName` | Mother's maiden name | Zita ramai vasati varoorwa | Ibizo likamama lakwabo | **Review** |
| `motherNationalId` | Mother's National ID | Nhamba yechitupa chamai | Inombolo yesitupa sikamama | Medium |
| `fatherFullName` | Father's full name | Zita rakazara rababa | Ibizo eligcweleyo likababa | Medium |
| `fatherNationalId` | Father's National ID | Nhamba yechitupa chababa | Inombolo yesitupa sikababa | Medium |
| `guardianName` | Parent / guardian name | Zita remubereki kana muchengeti | Ibizo lomzali loba umlindi | **Review** |
| `applicationReason` | Application reason | Chikonzero chekunyorera | Isizatho sesicelo | **Review** |
| `documentServiceType` | Document service type | Rudzi rwegwaro | Uhlobo lwephepha | Review |
| `personalDetails` | Personal details | Ruzivo rwako | Imininingwane yakho | Medium |
| `additionalDetails` | Additional details | Rumwe ruzivo | Eminye imininingwane | Medium |
| `documentChecklist` | Document checklist | Runyorwa rwemagwaro | Uhlu lwamaphepha | Review |
| `iHaveThisDocument` | Tick each document you already have | Tara gwaro rimwe nerimwe raunaro | Thikha iphepha ngalinye olalo | Review |
| `selectOption` | Select… | Sarudza… | Khetha… | High |
| `submitApplication` | Submit application | Tumira chikumbiro | Thumela isicelo | Medium |
| `cancel` | Cancel | Rega | Yekela | Review |

### Decisions worth recording

**National ID — Ndebele `isitupa` (approved).** Standard Nguni would suggest
*umazisi*, but that reads as Zulu. Zimbabwean Ndebele speakers commonly use
*isitupa*, borrowed from the Shona *chitupa*. `isitupa` was chosen deliberately
to avoid a South African Zulu substitution.

**Gender — Shona.** Shona has no idiomatic abstract noun for "gender" that suits
an official form. Rather than coin one, the label uses the enumerated form
*"Murume kana mukadzi"* (male or female), which is how Zimbabwean forms
conventionally express it.

**Passwords.** Both renderings are loanwords. They are widely understood in
practice but may read as informal on an official document. Flagged for review.

## 6. Why checklist item descriptions remain English

The checklist strings are **not display-only text**. `intakeForm.jsx:78` maps
each one straight into the submitted payload:

```js
config.checklist.map((label) => ({ itemLabel: label, isAvailable: false }))
```

That `itemLabel` is POSTed to the intake endpoint and written to
`checklist_items.item_label` in Postgres. Translating these strings in place
would change API payload values and store non-English text as record data. The
checklist was therefore left as a plain English string array — deliberately
unchanged.

They are also long, specific legal document names
("Notification of Birth from hospital/clinic (or witness affidavit for home
births)"). Producing unverified translations of legal document names carries
real risk of altering meaning.

The checklist **heading** and the **instruction** above it are translated; the
item descriptions stay English. English remains the primary language for longer
guidance in v1.0, consistent with the SRS.

## 7. Accessibility approach

- Every field uses `htmlFor` paired with a matching input `id`. The
  admin-assisted intake form previously had **no** `htmlFor` or `id` at all;
  this was fixed as part of the work.
- Placeholders are never the only label.
- The Shona/Ndebele line carries `aria-hidden="true"`. **Rationale:** a screen
  reader applies a single pronunciation engine to the whole accessible name, so
  concatenating three languages produces garbled speech. Sighted users see all
  three; assistive technology receives one clean English name.
- The visual `*` is `aria-hidden`; required state is conveyed by the input's own
  `required` attribute, which assistive technology announces natively.
- `<option>` elements cannot contain child elements, so Male/Female use the
  SRS's own inline format (`Male / Murume / Owesilisa`). These are short enough
  to read acceptably aloud.
- Keyboard navigation and error handling are untouched.

## 8. Data and logic safety

No form state key, API payload key, database column, enum value, role, or
status value was renamed. Specifically preserved: `fullName`, `dateOfBirth`,
`gender`, `placeOfOrigin`, `districtCode`, `details`, `checklist`, `itemLabel`,
`isAvailable`, the `male`/`female` option values, `documentType` values
(`national_id`, `birth_certificate`), and all five `status` enum values
(`submitted`, `under_review`, `missing_information`,
`ready_for_registry_visit`, `closed`).

Only visible text changed.

## 9. Known limitations

1. **Translations are unverified.** Apart from `name` (SRS-established) and the
   approved `isitupa`, every entry is a proposal made during implementation. No
   native speaker has reviewed them. Entries marked **Review** should be
   confirmed before this is presented as production-ready civic software.
2. **No authoritative source exists in this repository's research.** Searches of
   Zimbabwean government and dictionary resources confirmed *chitupa* for the
   national ID, but did not yield an official Shona/Ndebele civil-registry
   glossary. The translations are therefore not sourced from an authority.
3. **Action buttons remain English** (Submit, Cancel). Adding a second text line
   inside buttons risked overflow on mobile; labels and instructions were
   prioritised, matching the SRS wording.
4. **Citizen login is not translated** — deliberately skipped.
5. **Checklist item descriptions remain English** — see §6.
6. **The admin-assisted intake form is still non-functional.** It has no server
   endpoint (`adminDashboard.jsx` alerts on submit). Labels and accessibility
   were improved, but the form does not save.

## 10. Future improvement — full internationalisation

If ZivaID moves beyond v1.0, the natural progression is a real i18n layer with a
language switcher, locale persistence, `lang` attributes per text run (which
would fix the screen-reader constraint in §7), pluralisation, and date/number
localisation. The current `multilingualLabels.js` is deliberately shaped so its
keys can be lifted into locale files without touching component markup.

## 11. Sources consulted

- [Zimbabwe Country Report on Birth Registration](http://citizenshiprightsafrica.org/wp-content/uploads/2018/10/Zimbabwe_Country_Report_Birth_Reg_2005.pdf) — confirmed *chitupa* as the Shona term for the national registration document
- [Embassy of Zimbabwe — Birth Certificates](https://www.zimaddis.gov.zw/birth-certificates/) — registry process terminology
- [Wiktionary — *ibizo*](https://en.wiktionary.org/wiki/ibizo) — confirmed Ndebele "name", distinct from Zulu *igama*
- [Ndebele language (Wikipedia)](https://en.wikipedia.org/wiki/Ndebele_language) — Zimbabwean Ndebele vs. Zulu relationship

None of these constitutes an official civil-registry glossary. Treat §5 as a
proposal pending review.
