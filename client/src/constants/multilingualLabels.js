// Multilingual form labels — English / Shona / Ndebele (SRS v1.0)
//
// ZivaID is required to show form labels in Zimbabwe's three main languages
// together, e.g. "Name / Zita / Ibizo". This is NOT a language switcher:
// all three are displayed at once, English visually primary.
//
// Language codes: en = English, sn = Shona (chiShona), nd = Ndebele (isiNdebele)
//
// ⚠️ TRANSLATION STATUS
// Only `name` is established by the SRS itself. The rest were proposed during
// implementation and are documented in docs/MULTILINGUAL_LABELS.md with a
// per-term confidence rating. Terms marked "review" there have NOT been
// confirmed by a native speaker. Do not treat them as authoritative for
// legal or identity-document purposes until reviewed.
//
// IMPORTANT: these strings are DISPLAY ONLY. They must never be used as
// form state keys, API payload values, enum values, or database values.
// The checklist in intakeForm.jsx submits `itemLabel: item.en` on purpose,
// so the value stored in Postgres stays English.

export const multilingualLabels = {
  // --- Identity ---
  name: {
    en: 'Name',
    sn: 'Zita',
    nd: 'Ibizo',
  },
  fullName: {
    en: 'Full name',
    sn: 'Zita rakazara',
    nd: 'Ibizo eligcweleyo',
  },
  fullLegalName: {
    en: 'Full legal name',
    sn: 'Zita rakazara rapamutemo',
    nd: 'Ibizo eligcweleyo elisemthethweni',
  },
  dateOfBirth: {
    en: 'Date of birth',
    sn: 'Zuva rekuzvarwa',
    nd: 'Usuku lokuzalwa',
  },
  gender: {
    // Shona commonly expresses this as "male or female" rather than an
    // abstract noun; a literal coinage would read oddly on an official form.
    en: 'Gender',
    sn: 'Murume kana mukadzi',
    nd: 'Ubulili',
  },
  male: {
    en: 'Male',
    sn: 'Murume',
    nd: 'Owesilisa',
  },
  female: {
    en: 'Female',
    sn: 'Mukadzi',
    nd: 'Owesifazana',
  },

  // --- Contact / account ---
  emailAddress: {
    en: 'Email address',
    sn: 'Kero yeemail',
    nd: 'Ikheli le-imeyili',
  },
  password: {
    en: 'Password',
    sn: 'Pasiwedhi',
    nd: 'Iphasiwedi',
  },
  createPassword: {
    en: 'Create password',
    sn: 'Gadzira pasiwedhi',
    nd: 'Yenza iphasiwedi',
  },

  // --- Documents (see review notes in docs/MULTILINGUAL_LABELS.md) ---
  nationalIdNumber: {
    en: 'National ID number',
    sn: 'Nhamba yechitupa',
    nd: 'Inombolo yesitupa',
  },
  birthCertificateEntryNumber: {
    en: 'Birth certificate entry number',
    sn: 'Nhamba yegwaro rekuzvarwa',
    nd: 'Inombolo yesitifiketi sokuzalwa',
  },

  // --- Place ---
  districtOfRegistration: {
    en: 'District of registration',
    sn: 'Dunhu rekunyoreswa',
    nd: 'Isigaba sokubhalisa',
  },
  districtOrProvince: {
    en: 'District / registry province',
    sn: 'Dunhu kana provhinzi',
    nd: 'Isigaba loba isifundazwe',
  },
  placeOfOrigin: {
    en: 'Place of origin',
    sn: 'Nzvimbo yaunobva',
    nd: 'Indawo elivela kuyo',
  },
  hospitalOfBirth: {
    en: 'Hospital / clinic of birth',
    sn: 'Chipatara kana kiriniki yekuzvarirwa',
    nd: 'Isibhedlela loba umtholampilo wokuzalwa',
  },
  residentialAddress: {
    en: 'Residential address',
    sn: 'Kero yekugara',
    nd: 'Ikheli lokuhlala',
  },

  // --- Family ---
  motherFullName: {
    en: "Mother's full name",
    sn: 'Zita rakazara ramai',
    nd: 'Ibizo eligcweleyo likamama',
  },
  motherMaidenName: {
    en: "Mother's maiden name",
    sn: 'Zita ramai vasati varoorwa',
    nd: 'Ibizo likamama lakwabo',
  },
  motherNationalId: {
    en: "Mother's National ID",
    sn: 'Nhamba yechitupa chamai',
    nd: 'Inombolo yesitupa sikamama',
  },
  fatherFullName: {
    en: "Father's full name",
    sn: 'Zita rakazara rababa',
    nd: 'Ibizo eligcweleyo likababa',
  },
  fatherNationalId: {
    en: "Father's National ID",
    sn: 'Nhamba yechitupa chababa',
    nd: 'Inombolo yesitupa sikababa',
  },
  guardianName: {
    en: 'Parent / guardian name',
    sn: 'Zita remubereki kana muchengeti',
    nd: 'Ibizo lomzali loba umlindi',
  },

  // --- Application ---
  applicationReason: {
    en: 'Application reason',
    sn: 'Chikonzero chekunyorera',
    nd: 'Isizatho sesicelo',
  },
  documentServiceType: {
    en: 'Document service type',
    sn: 'Rudzi rwegwaro',
    nd: 'Uhlobo lwephepha',
  },

  // --- Section headings ---
  personalDetails: {
    en: 'Personal details',
    sn: 'Ruzivo rwako',
    nd: 'Imininingwane yakho',
  },
  additionalDetails: {
    en: 'Additional details',
    sn: 'Rumwe ruzivo',
    nd: 'Eminye imininingwane',
  },
  documentChecklist: {
    en: 'Document checklist',
    sn: 'Runyorwa rwemagwaro',
    nd: 'Uhlu lwamaphepha',
  },

  // --- Guidance / actions ---
  iHaveThisDocument: {
    en: 'Tick each document you already have',
    sn: 'Tara gwaro rimwe nerimwe raunaro',
    nd: 'Thikha iphepha ngalinye olalo',
  },
  selectOption: {
    en: 'Select…',
    sn: 'Sarudza…',
    nd: 'Khetha…',
  },
  submitApplication: {
    en: 'Submit application',
    sn: 'Tumira chikumbiro',
    nd: 'Thumela isicelo',
  },
  cancel: {
    en: 'Cancel',
    sn: 'Rega',
    nd: 'Yekela',
  },
};

export default multilingualLabels;
