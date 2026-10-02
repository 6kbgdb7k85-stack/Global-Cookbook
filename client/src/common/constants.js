export const FIELD_TYPES = {
  TEXT: "TEXT",
  PASSWORD: "PASSWORD",
  EMAIL: "EMAIL",
  NUMBER: "NUMBER",
  TEXTAREA: "TEXTAREA",
  SWITCH: "SWITCH",
};

export const MUI_TYPOGRAPHY_SIZES = {
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
  BODY1: "body1",
  BODY2: "body2",
  SUBTITLE1: "subtitle1",
  SUBTITLE2: "subtitle2",
  BUTTON: "button",
  CAPTION: "caption",
  OVERLINE: "overline",
};

export const RECIPE_FIELDS = [
  {
    id: "name",
    label: "Name",
    type: FIELD_TYPES.TEXT,
    size: MUI_TYPOGRAPHY_SIZES.H4,
    required: true,
  },
  {
    id: "description",
    label: "Description",
    type: FIELD_TYPES.TEXT,
    size: MUI_TYPOGRAPHY_SIZES.H6,
  },
  {
    id: "ingredients",
    label: "Ingredients",
    type: FIELD_TYPES.TEXTAREA,
    size: MUI_TYPOGRAPHY_SIZES.BODY1,
  },
  {
    id: "instructions",
    label: "Instructions",
    type: FIELD_TYPES.TEXTAREA,
    size: MUI_TYPOGRAPHY_SIZES.BODY2,
  },
  {
    id: "created_time",
    label: "Created",
    type: FIELD_TYPES.TEXT,
    readonly: true,
    size: MUI_TYPOGRAPHY_SIZES.CAPTION,
    uiOnly: true,
    colSpan: 6,
  },
  {
    id: "private",
    label: "Private",
    type: FIELD_TYPES.SWITCH,
    alwaysEdit:true,
    size: MUI_TYPOGRAPHY_SIZES.BODY1,
    colSpan:6
  },
];
