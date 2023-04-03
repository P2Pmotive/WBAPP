using WeightService as service from '../../srv/cat-service';

annotate service.offSyncWeightDetails with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Purchase Order No',
            Value : PoNo,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Gross weight',
            Value : Gross_weight,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Tare weight',
            Value : Tare_weight,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Net weight',
            Value : Net_weight,
        },
        {
            $Type : 'UI.DataField',
            Label : 'VehicleNo',
            Value : vehical_No,
        },
        {
            $Type : 'UI.DataField',
            Label : 'UoM',
            Value : Uom,
        },
    ]
);
annotate service.offSyncWeightDetails with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Purchase Order No',
                Value : PoNo,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Vehicle No',
                Value : vehical_No,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Error Status',
                Value : error_status,
            },
        ],
    },
     UI.FieldGroup #WeightDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Gross weight',
                Value : Gross_weight,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Gross_wtTime',
                Value : Gross_wtTime,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Tare weight',
                Value : Tare_weight,
            }, 
            {
                $Type : 'UI.DataField',
                Label : 'Tare_wtTime',
                Value : Tare_wtTime,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Net weight',
                Value : Net_weight,
            },
            {
                $Type : 'UI.DataField',
                Label : 'UoM',
                Value : Uom,
            }
        ],
    }, UI.FieldGroup #LogDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'createdBy',
                Value : createdBy,
            },
            {
                $Type : 'UI.DataField',
                Label : 'createdAt',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'modifiedBy',
                Value : modifiedBy,
            },
             {
                $Type : 'UI.DataField',
                Label : 'modifiedAt',
                Value : modifiedAt,
            }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },{
            $Type : 'UI.ReferenceFacet',
            ID : 'WeightDetails',
            Label : 'Weight Details',
            Target : '@UI.FieldGroup#WeightDetails',
        },{
            $Type : 'UI.ReferenceFacet',
            ID : 'LogDetails',
            Label : 'Log Details',
            Target : '@UI.FieldGroup#LogDetails',
        }
    ]
);
