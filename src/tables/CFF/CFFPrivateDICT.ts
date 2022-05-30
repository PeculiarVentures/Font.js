import { DICTParameters, DICT } from "./DICT";

export interface CFFPrivateDICTParameters extends DICTParameters {
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
  ForceBold?: boolean;
  LanguageGroup?: number;
  ExpansionFactor?: number;
  initialRandomSeed?: number;
  Subrs?: number;
  defaultWidthX?: number;
  nominalWidthX?: number;
}

export class CFFPrivateDICT extends DICT {
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
  public ForceBold: boolean;
  public LanguageGroup: number;
  public ExpansionFactor: number;
  public initialRandomSeed: number;
  public Subrs?: number;
  public defaultWidthX: number;
  public nominalWidthX: number;

  constructor(parameters: CFFPrivateDICTParameters = {}) {
    super(parameters);

    if ("BlueValues" in parameters) {
      this.BlueValues = parameters.BlueValues;
    }
    if ("OtherBlues" in parameters) {
      this.OtherBlues = parameters.OtherBlues;
    }
    if ("FamilyBlues" in parameters) {
      this.FamilyBlues = parameters.FamilyBlues;
    }
    if ("FamilyOtherBlues" in parameters) {
      this.FamilyOtherBlues = parameters.FamilyOtherBlues;
    }

    this.BlueScale = parameters.BlueScale || 0.039625;
    this.BlueShift = parameters.BlueShift || 7;
    this.BlueFuzz = parameters.BlueFuzz || 1;

    if ("StdHW" in parameters) {
      this.StdHW = parameters.StdHW;
    }
    if ("StdVW" in parameters) {
      this.StdVW = parameters.StdVW;
    }
    if ("SteamSnapH" in parameters) {
      this.SteamSnapH = parameters.SteamSnapH;
    }
    if ("SteamSnapV" in parameters) {
      this.SteamSnapV = parameters.SteamSnapV;
    }

    this.ForceBold = parameters.ForceBold || false;
    this.LanguageGroup = parameters.LanguageGroup || 0;
    this.ExpansionFactor = parameters.ExpansionFactor || 0.06;
    this.initialRandomSeed = parameters.initialRandomSeed || 0;

    if ("Subrs" in parameters) {
      this.Subrs = parameters.Subrs;
    }

    this.defaultWidthX = parameters.defaultWidthX || 0;
    this.nominalWidthX = parameters.nominalWidthX || 0;
  }

  /**
   * Convert ArrayBuffer data to object
   *
   * @param buffer
   *
   * @returns Result of the function
   */
  static fromBuffer(buffer: ArrayBuffer) {
    const dict = DICT.fromBuffer(buffer);

    const parameters: CFFPrivateDICTParameters = { entries: dict.entries };

    for (const entry of dict.entries) {
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
        case 1214:
          parameters.ForceBold = !!(entry.values[0]);
          break;
        case 1217:
          parameters.LanguageGroup = entry.values[0];
          break;
        case 1218:
          parameters.ExpansionFactor = entry.values[0];
          break;
        case 1219:
          parameters.initialRandomSeed = entry.values[0];
          break;
        case 19:
          parameters.Subrs = entry.values[0];
          break;
        case 20:
          parameters.defaultWidthX = entry.values[0];
          break;
        case 21:
          parameters.nominalWidthX = entry.values[0];
          break;
        default:
      }
    }

    return new CFFPrivateDICT(parameters);
  }

}
