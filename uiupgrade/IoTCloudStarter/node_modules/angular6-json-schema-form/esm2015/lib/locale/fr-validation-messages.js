export const frValidationMessages = {
    required: 'Est obligatoire.',
    minLength: 'Doit avoir minimum {{minimumLength}} caractères (actuellement: {{currentLength}})',
    maxLength: 'Doit avoir maximum {{maximumLength}} caractères (actuellement: {{currentLength}})',
    pattern: 'Doit respecter: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Doit être une date, tel que "2000-12-31"';
            case 'time':
                return 'Doit être une heure, tel que "16:20" ou "03:14:15.9265"';
            case 'date-time':
                return 'Doit être une date et une heure, tel que "2000-03-14T01:59" ou "2000-03-14T01:59:26.535Z"';
            case 'email':
                return 'Doit être une adresse e-mail, tel que "name@example.com"';
            case 'hostname':
                return 'Doit être un nom de domaine, tel que "example.com"';
            case 'ipv4':
                return 'Doit être une adresse IPv4, tel que "127.0.0.1"';
            case 'ipv6':
                return 'Doit être une adresse IPv6, tel que "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return 'Doit être une URL, tel que "http://www.example.com/page.html"';
            case 'uuid':
                return 'Doit être un UUID, tel que "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Doit être une couleur, tel que "#FFFFFF" or "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Doit être un JSON Pointer, tel que "/pointer/to/something"';
            case 'relative-json-pointer':
                return 'Doit être un relative JSON Pointer, tel que "2/pointer/to/something"';
            case 'regex':
                return 'Doit être une expression régulière, tel que "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Doit être avoir le format correct: ' + error.requiredFormat;
        }
    },
    minimum: 'Doit être supérieur à {{minimumValue}}',
    exclusiveMinimum: 'Doit avoir minimum {{exclusiveMinimumValue}} charactères',
    maximum: 'Doit être inférieur à {{maximumValue}}',
    exclusiveMaximum: 'Doit avoir maximum {{exclusiveMaximumValue}} charactères',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Doit comporter ${decimals} ou moins de decimales.`;
        }
        else {
            return `Doit être un multiple de ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Doit comporter au minimum {{minimumProperties}} éléments',
    maxProperties: 'Doit comporter au maximum {{maximumProperties}} éléments',
    minItems: 'Doit comporter au minimum {{minimumItems}} éléments',
    maxItems: 'Doit comporter au maximum {{minimumItems}} éléments',
    uniqueItems: 'Tous les éléments doivent être uniques',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnItdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvbG9jYWxlL2ZyLXZhbGlkYXRpb24tbWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQVE7SUFDdkMsUUFBUSxFQUFFLGtCQUFrQjtJQUM1QixTQUFTLEVBQUUsbUZBQW1GO0lBQzlGLFNBQVMsRUFBRSxtRkFBbUY7SUFDOUYsT0FBTyxFQUFFLHFDQUFxQztJQUM5QyxNQUFNLEVBQUUsVUFBVSxLQUFLO1FBQ3JCLFFBQVEsS0FBSyxDQUFDLGNBQWMsRUFBRTtZQUM1QixLQUFLLE1BQU07Z0JBQ1QsT0FBTywwQ0FBMEMsQ0FBQztZQUNwRCxLQUFLLE1BQU07Z0JBQ1QsT0FBTyx5REFBeUQsQ0FBQztZQUNuRSxLQUFLLFdBQVc7Z0JBQ2QsT0FBTywyRkFBMkYsQ0FBQztZQUNyRyxLQUFLLE9BQU87Z0JBQ1YsT0FBTywwREFBMEQsQ0FBQztZQUNwRSxLQUFLLFVBQVU7Z0JBQ2IsT0FBTyxvREFBb0QsQ0FBQztZQUM5RCxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxpREFBaUQsQ0FBQztZQUMzRCxLQUFLLE1BQU07Z0JBQ1QsT0FBTywrRUFBK0UsQ0FBQztZQUN6RixvRUFBb0U7WUFDcEUseURBQXlEO1lBQ3pELEtBQUssS0FBSztnQkFDUixPQUFPLCtEQUErRCxDQUFDO1lBQ3pFLEtBQUssTUFBTTtnQkFDVCxPQUFPLG1FQUFtRSxDQUFDO1lBQzdFLEtBQUssT0FBTztnQkFDVixPQUFPLGtFQUFrRSxDQUFDO1lBQzVFLEtBQUssY0FBYztnQkFDakIsT0FBTyw0REFBNEQsQ0FBQztZQUN0RSxLQUFLLHVCQUF1QjtnQkFDMUIsT0FBTyxzRUFBc0UsQ0FBQztZQUNoRixLQUFLLE9BQU87Z0JBQ1YsT0FBTyx5RUFBeUUsQ0FBQztZQUNuRjtnQkFDRSxPQUFPLHFDQUFxQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7U0FDdkU7SUFDSCxDQUFDO0lBQ0QsT0FBTyxFQUFFLHdDQUF3QztJQUNqRCxnQkFBZ0IsRUFBRSwwREFBMEQ7SUFDNUUsT0FBTyxFQUFFLHdDQUF3QztJQUNqRCxnQkFBZ0IsRUFBRSwwREFBMEQ7SUFDNUUsVUFBVSxFQUFFLFVBQVUsS0FBSztRQUN6QixJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN2RCxPQUFPLGtCQUFrQixRQUFRLHlCQUF5QixDQUFDO1NBQzVEO2FBQU07WUFDTCxPQUFPLDRCQUE0QixLQUFLLENBQUMsZUFBZSxHQUFHLENBQUM7U0FDN0Q7SUFDSCxDQUFDO0lBQ0QsYUFBYSxFQUFFLDBEQUEwRDtJQUN6RSxhQUFhLEVBQUUsMERBQTBEO0lBQ3pFLFFBQVEsRUFBRSxxREFBcUQ7SUFDL0QsUUFBUSxFQUFFLHFEQUFxRDtJQUMvRCxXQUFXLEVBQUUsd0NBQXdDO0NBRXRELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZnJWYWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHsgLy8gRnJlbmNoIGVycm9yIG1lc3NhZ2VzXG4gIHJlcXVpcmVkOiAnRXN0IG9ibGlnYXRvaXJlLicsXG4gIG1pbkxlbmd0aDogJ0RvaXQgYXZvaXIgbWluaW11bSB7e21pbmltdW1MZW5ndGh9fSBjYXJhY3TDqHJlcyAoYWN0dWVsbGVtZW50OiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBtYXhMZW5ndGg6ICdEb2l0IGF2b2lyIG1heGltdW0ge3ttYXhpbXVtTGVuZ3RofX0gY2FyYWN0w6hyZXMgKGFjdHVlbGxlbWVudDoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgcGF0dGVybjogJ0RvaXQgcmVzcGVjdGVyOiB7e3JlcXVpcmVkUGF0dGVybn19JyxcbiAgZm9ybWF0OiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBzd2l0Y2ggKGVycm9yLnJlcXVpcmVkRm9ybWF0KSB7XG4gICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuZSBkYXRlLCB0ZWwgcXVlIFwiMjAwMC0xMi0zMVwiJztcbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGhldXJlLCB0ZWwgcXVlIFwiMTY6MjBcIiBvdSBcIjAzOjE0OjE1LjkyNjVcIic7XG4gICAgICBjYXNlICdkYXRlLXRpbWUnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGRhdGUgZXQgdW5lIGhldXJlLCB0ZWwgcXVlIFwiMjAwMC0wMy0xNFQwMTo1OVwiIG91IFwiMjAwMC0wMy0xNFQwMTo1OToyNi41MzVaXCInO1xuICAgICAgY2FzZSAnZW1haWwnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGFkcmVzc2UgZS1tYWlsLCB0ZWwgcXVlIFwibmFtZUBleGFtcGxlLmNvbVwiJztcbiAgICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuIG5vbSBkZSBkb21haW5lLCB0ZWwgcXVlIFwiZXhhbXBsZS5jb21cIic7XG4gICAgICBjYXNlICdpcHY0JzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuZSBhZHJlc3NlIElQdjQsIHRlbCBxdWUgXCIxMjcuMC4wLjFcIic7XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuZSBhZHJlc3NlIElQdjYsIHRlbCBxdWUgXCIxMjM0OjU2Nzg6OUFCQzpERUYwOjEyMzQ6NTY3ODo5QUJDOkRFRjBcIic7XG4gICAgICAvLyBUT0RPOiBhZGQgZXhhbXBsZXMgZm9yICd1cmknLCAndXJpLXJlZmVyZW5jZScsIGFuZCAndXJpLXRlbXBsYXRlJ1xuICAgICAgLy8gY2FzZSAndXJpJzogY2FzZSAndXJpLXJlZmVyZW5jZSc6IGNhc2UgJ3VyaS10ZW1wbGF0ZSc6XG4gICAgICBjYXNlICd1cmwnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIFVSTCwgdGVsIHF1ZSBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vcGFnZS5odG1sXCInO1xuICAgICAgY2FzZSAndXVpZCc6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1biBVVUlELCB0ZWwgcXVlIFwiMTIzNDU2NzgtOUFCQy1ERUYwLTEyMzQtNTY3ODlBQkNERUYwXCInO1xuICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGNvdWxldXIsIHRlbCBxdWUgXCIjRkZGRkZGXCIgb3IgXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIic7XG4gICAgICBjYXNlICdqc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW4gSlNPTiBQb2ludGVyLCB0ZWwgcXVlIFwiL3BvaW50ZXIvdG8vc29tZXRoaW5nXCInO1xuICAgICAgY2FzZSAncmVsYXRpdmUtanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuIHJlbGF0aXZlIEpTT04gUG9pbnRlciwgdGVsIHF1ZSBcIjIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWdleCc6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1bmUgZXhwcmVzc2lvbiByw6lndWxpw6hyZSwgdGVsIHF1ZSBcIigxLSk/XFxcXGR7M30tXFxcXGR7M30tXFxcXGR7NH1cIic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgYXZvaXIgbGUgZm9ybWF0IGNvcnJlY3Q6ICcgKyBlcnJvci5yZXF1aXJlZEZvcm1hdDtcbiAgICB9XG4gIH0sXG4gIG1pbmltdW06ICdEb2l0IMOqdHJlIHN1cMOpcmlldXIgw6Age3ttaW5pbXVtVmFsdWV9fScsXG4gIGV4Y2x1c2l2ZU1pbmltdW06ICdEb2l0IGF2b2lyIG1pbmltdW0ge3tleGNsdXNpdmVNaW5pbXVtVmFsdWV9fSBjaGFyYWN0w6hyZXMnLFxuICBtYXhpbXVtOiAnRG9pdCDDqnRyZSBpbmbDqXJpZXVyIMOgIHt7bWF4aW11bVZhbHVlfX0nLFxuICBleGNsdXNpdmVNYXhpbXVtOiAnRG9pdCBhdm9pciBtYXhpbXVtIHt7ZXhjbHVzaXZlTWF4aW11bVZhbHVlfX0gY2hhcmFjdMOocmVzJyxcbiAgbXVsdGlwbGVPZjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgaWYgKCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKSAlIDEwID09PSAwKSB7XG4gICAgICBjb25zdCBkZWNpbWFscyA9IE1hdGgubG9nMTAoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSk7XG4gICAgICByZXR1cm4gYERvaXQgY29tcG9ydGVyICR7ZGVjaW1hbHN9IG91IG1vaW5zIGRlIGRlY2ltYWxlcy5gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYERvaXQgw6p0cmUgdW4gbXVsdGlwbGUgZGUgJHtlcnJvci5tdWx0aXBsZU9mVmFsdWV9LmA7XG4gICAgfVxuICB9LFxuICBtaW5Qcm9wZXJ0aWVzOiAnRG9pdCBjb21wb3J0ZXIgYXUgbWluaW11bSB7e21pbmltdW1Qcm9wZXJ0aWVzfX0gw6lsw6ltZW50cycsXG4gIG1heFByb3BlcnRpZXM6ICdEb2l0IGNvbXBvcnRlciBhdSBtYXhpbXVtIHt7bWF4aW11bVByb3BlcnRpZXN9fSDDqWzDqW1lbnRzJyxcbiAgbWluSXRlbXM6ICdEb2l0IGNvbXBvcnRlciBhdSBtaW5pbXVtIHt7bWluaW11bUl0ZW1zfX0gw6lsw6ltZW50cycsXG4gIG1heEl0ZW1zOiAnRG9pdCBjb21wb3J0ZXIgYXUgbWF4aW11bSB7e21pbmltdW1JdGVtc319IMOpbMOpbWVudHMnLFxuICB1bmlxdWVJdGVtczogJ1RvdXMgbGVzIMOpbMOpbWVudHMgZG9pdmVudCDDqnRyZSB1bmlxdWVzJyxcbiAgLy8gTm90ZTogTm8gZGVmYXVsdCBlcnJvciBtZXNzYWdlcyBmb3IgJ3R5cGUnLCAnY29uc3QnLCAnZW51bScsIG9yICdkZXBlbmRlbmNpZXMnXG59O1xuIl19