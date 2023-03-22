using { managed } from '@sap/cds/common';
namespace com.weighbridge;


entity weightDetails :managed {
  key gate: String;
  weight: Decimal;
  uom: String;
}

entity syncWeightDetails : managed{
key PoNo:String;
Gross_weight:Decimal;
Tare_weight:Decimal;
Net_weight:Decimal;
Uom: String;
Gross_wtTime: Timestamp;
Tare_wtTime: Timestamp;
vehical_No:String;
error_status:String;

}