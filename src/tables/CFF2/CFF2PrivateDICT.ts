import { DICTParameters, INDEX, DICT } from "../CFF";
import { CFF2CharstringINDEX } from "./CFF2CharstringINDEX";

export interface CFF2PrivateDICTParameters extends DICTParameters {
  BlueValues?: number[];
  OtherBlues?: number[];
  FamilyBlues?: number[];
  FamilyOtherBlues?: number[];
  BlueScale?: number;
  BlueShift?: number;
  BlueFuzz?: number;
  StdHW?: number;
  StdVW?: number;
  SteamSnapH?: number[];
  SteamSnapV?: number[];
  LanguageGroup?: number;
  ExpansionFactor?: number;
  vsindex?: number;
  blend?: number;
  Subrs?: number;
  SubrsINDEX?: CFF2CharstringINDEX;
}

export class CFF2PrivateDICT extends DICT {

  public BlueValues?: number[];
  public OtherBlues?: number[];
  public FamilyBlues?: number[];
  public FamilyOtherBlues?: number[];
  public BlueScale: number;
  public BlueShift: number;
  public BlueFuzz: number;
  public StdHW?: number;
  public StdVW?: number;
  public SteamSnapH?: number[];
  public SteamSnapV?: number[];
  public LanguageGroup: number;
  public ExpansionFactor: number;
  public vsindex: number;
  public blend?: number;
  public Subrs?: number;
  public SubrsINDEX?: CFF2CharstringINDEX;

  constructor(parameters: CFF2PrivateDICTParameters = {}) {
    super(parameters);

    if ("BlueValues" in parameters)
      this.BlueValues = parameters.BlueValues;
    if ("OtherBlues" in parameters)
      this.OtherBlues = parameters.OtherBlues;
    if ("FamilyBlues" in parameters)
      this.FamilyBlues = parameters.FamilyBlues;
    if ("FamilyOtherBlues" in parameters)
      this.FamilyOtherBlues = parameters.FamilyOtherBlues;

    this.BlueScale = parameters.BlueScale || 0.039625;
    this.BlueShift = parameters.BlueShift || 7;
    this.BlueFuzz = parameters.BlueFuzz || 1;

    if ("StdHW" in parameters)
      this.StdHW = parameters.StdHW;
    if ("StdVW" in parameters)
      this.StdVW = parameters.StdVW;
    if ("SteamSnapH" in parameters)
      this.SteamSnapH = parameters.SteamSnapH;
    if ("SteamSnapV" in parameters)
      this.SteamSnapV = parameters.SteamSnapV;

    this.LanguageGroup = parameters.LanguageGroup || 0;
    this.ExpansionFactor = parameters.ExpansionFactor || 0.06;
    this.vsindex = parameters.vsindex || 0;

    if ("blend" in parameters)
      this.blend = parameters.blend;
    if ("Subrs" in parameters)
      this.Subrs = parameters.Subrs;
    if ("SubrsINDEX" in parameters)
      this.SubrsINDEX = parameters.SubrsINDEX;
  }

  static fromBuffer(buffer: ArrayBuffer) {
    const dict = DICT.fromBuffer(buffer);

    const parameters: CFF2PrivateDICTParameters = { entries: dict.entries };

    for (const entry of dict.entries) {
      if (entry.values.length === 0)
        continue;

      switch (entry.key) {
        case 6:
          parameters.BlueValues = entry.values;
          break;
        case 7:
          parameters.OtherBlues = entry.values;
          break;
        case 8:
          parameters.FamilyBlues = entry.values;
          break;
        case 9:
          parameters.FamilyOtherBlues = entry.values;
          break;
        case 1209:
          parameters.BlueScale = entry.values[0];
          break;
        case 1210:
          parameters.BlueShift = entry.values[0];
          break;
        case 1211:
          parameters.BlueFuzz = entry.values[0];
          break;
        case 10:
          parameters.StdHW = entry.values[0];
          break;
        case 11:
          parameters.StdVW = entry.values[0];
          break;
        case 1212:
          parameters.SteamSnapH = entry.values;
          break;
        case 1213:
          parameters.SteamSnapV = entry.values;
          break;
        case 1217:
          parameters.LanguageGroup = entry.values[0];
          break;
        case 1218:
          parameters.ExpansionFactor = entry.values[0];
          break;
        case 19:
          parameters.Subrs = entry.values[0];
          break;
        case 22:
          parameters.vsindex = entry.values[0];
          break;
        case 23:
          parameters.blend = entry.values[0];
          break;
        default:
      }
    }

    return new CFF2PrivateDICT(parameters);
  }

}
