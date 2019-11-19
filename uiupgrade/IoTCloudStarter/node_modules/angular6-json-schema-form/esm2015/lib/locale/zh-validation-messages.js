export const zhValidationMessages = {
    required: '必填字段.',
    minLength: '字符长度必须大于或者等于 {{minimumLength}} (当前长度: {{currentLength}})',
    maxLength: '字符长度必须小于或者等于 {{maximumLength}} (当前长度: {{currentLength}})',
    pattern: '必须匹配正则表达式: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return '必须为日期格式, 比如 "2000-12-31"';
            case 'time':
                return '必须为时间格式, 比如 "16:20" 或者 "03:14:15.9265"';
            case 'date-time':
                return '必须为日期时间格式, 比如 "2000-03-14T01:59" 或者 "2000-03-14T01:59:26.535Z"';
            case 'email':
                return '必须为邮箱地址, 比如 "name@example.com"';
            case 'hostname':
                return '必须为主机名, 比如 "example.com"';
            case 'ipv4':
                return '必须为 IPv4 地址, 比如 "127.0.0.1"';
            case 'ipv6':
                return '必须为 IPv6 地址, 比如 "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return '必须为 url, 比如 "http://www.example.com/page.html"';
            case 'uuid':
                return '必须为 uuid, 比如 "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return '必须为颜色值, 比如 "#FFFFFF" 或者 "rgb(255, 255, 255)"';
            case 'json-pointer':
                return '必须为 JSON Pointer, 比如 "/pointer/to/something"';
            case 'relative-json-pointer':
                return '必须为相对的 JSON Pointer, 比如 "2/pointer/to/something"';
            case 'regex':
                return '必须为正则表达式, 比如 "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return '必须为格式正确的 ' + error.requiredFormat;
        }
    },
    minimum: '必须大于或者等于最小值: {{minimumValue}}',
    exclusiveMinimum: '必须大于最小值: {{exclusiveMinimumValue}}',
    maximum: '必须小于或者等于最大值: {{maximumValue}}',
    exclusiveMaximum: '必须小于最大值: {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `必须有 ${decimals} 位或更少的小数位`;
        }
        else {
            return `必须为 ${error.multipleOfValue} 的倍数`;
        }
    },
    minProperties: '项目数必须大于或者等于 {{minimumProperties}} (当前项目数: {{currentProperties}})',
    maxProperties: '项目数必须小于或者等于 {{maximumProperties}} (当前项目数: {{currentProperties}})',
    minItems: '项目数必须大于或者等于 {{minimumItems}} (当前项目数: {{currentItems}})',
    maxItems: '项目数必须小于或者等于 {{maximumItems}} (当前项目数: {{currentItems}})',
    uniqueItems: '所有项目必须是唯一的',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemgtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvbG9jYWxlL3poLXZhbGlkYXRpb24tbWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQVE7SUFDdkMsUUFBUSxFQUFFLE9BQU87SUFDakIsU0FBUyxFQUFFLDBEQUEwRDtJQUNyRSxTQUFTLEVBQUUsMERBQTBEO0lBQ3JFLE9BQU8sRUFBRSxnQ0FBZ0M7SUFDekMsTUFBTSxFQUFFLFVBQVUsS0FBSztRQUNyQixRQUFRLEtBQUssQ0FBQyxjQUFjLEVBQUU7WUFDNUIsS0FBSyxNQUFNO2dCQUNULE9BQU8sMEJBQTBCLENBQUM7WUFDcEMsS0FBSyxNQUFNO2dCQUNULE9BQU8sd0NBQXdDLENBQUM7WUFDbEQsS0FBSyxXQUFXO2dCQUNkLE9BQU8sZ0VBQWdFLENBQUM7WUFDMUUsS0FBSyxPQUFPO2dCQUNWLE9BQU8sZ0NBQWdDLENBQUM7WUFDMUMsS0FBSyxVQUFVO2dCQUNiLE9BQU8sMEJBQTBCLENBQUM7WUFDcEMsS0FBSyxNQUFNO2dCQUNULE9BQU8sNkJBQTZCLENBQUM7WUFDdkMsS0FBSyxNQUFNO2dCQUNULE9BQU8sMkRBQTJELENBQUM7WUFDckUsb0VBQW9FO1lBQ3BFLHlEQUF5RDtZQUN6RCxLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxnREFBZ0QsQ0FBQztZQUMxRCxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxxREFBcUQsQ0FBQztZQUMvRCxLQUFLLE9BQU87Z0JBQ1YsT0FBTyw4Q0FBOEMsQ0FBQztZQUN4RCxLQUFLLGNBQWM7Z0JBQ2pCLE9BQU8sOENBQThDLENBQUM7WUFDeEQsS0FBSyx1QkFBdUI7Z0JBQzFCLE9BQU8sa0RBQWtELENBQUM7WUFDNUQsS0FBSyxPQUFPO2dCQUNWLE9BQU8sMENBQTBDLENBQUM7WUFDcEQ7Z0JBQ0UsT0FBTyxXQUFXLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztTQUM3QztJQUNILENBQUM7SUFDRCxPQUFPLEVBQUUsK0JBQStCO0lBQ3hDLGdCQUFnQixFQUFFLG9DQUFvQztJQUN0RCxPQUFPLEVBQUUsK0JBQStCO0lBQ3hDLGdCQUFnQixFQUFFLG9DQUFvQztJQUN0RCxVQUFVLEVBQUUsVUFBVSxLQUFLO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sT0FBTyxRQUFRLFdBQVcsQ0FBQztTQUNuQzthQUFNO1lBQ0wsT0FBTyxPQUFPLEtBQUssQ0FBQyxlQUFlLE1BQU0sQ0FBQztTQUMzQztJQUNILENBQUM7SUFDRCxhQUFhLEVBQUUsa0VBQWtFO0lBQ2pGLGFBQWEsRUFBRSxrRUFBa0U7SUFDakYsUUFBUSxFQUFFLHdEQUF3RDtJQUNsRSxRQUFRLEVBQUUsd0RBQXdEO0lBQ2xFLFdBQVcsRUFBRSxZQUFZO0NBRTFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgemhWYWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHsgLy8gQ2hpbmVzZSBlcnJvciBtZXNzYWdlc1xuICByZXF1aXJlZDogJ+W/heWhq+Wtl+autS4nLFxuICBtaW5MZW5ndGg6ICflrZfnrKbplb/luqblv4XpobvlpKfkuo7miJbogIXnrYnkuo4ge3ttaW5pbXVtTGVuZ3RofX0gKOW9k+WJjemVv+W6pjoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgbWF4TGVuZ3RoOiAn5a2X56ym6ZW/5bqm5b+F6aG75bCP5LqO5oiW6ICF562J5LqOIHt7bWF4aW11bUxlbmd0aH19ICjlvZPliY3plb/luqY6IHt7Y3VycmVudExlbmd0aH19KScsXG4gIHBhdHRlcm46ICflv4XpobvljLnphY3mraPliJnooajovr7lvI86IHt7cmVxdWlyZWRQYXR0ZXJufX0nLFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHN3aXRjaCAoZXJyb3IucmVxdWlyZWRGb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuaXpeacn+agvOW8jywg5q+U5aaCIFwiMjAwMC0xMi0zMVwiJztcbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuaXtumXtOagvOW8jywg5q+U5aaCIFwiMTY6MjBcIiDmiJbogIUgXCIwMzoxNDoxNS45MjY1XCInO1xuICAgICAgY2FzZSAnZGF0ZS10aW1lJzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLrml6XmnJ/ml7bpl7TmoLzlvI8sIOavlOWmgiBcIjIwMDAtMDMtMTRUMDE6NTlcIiDmiJbogIUgXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIic7XG4gICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIHJldHVybiAn5b+F6aG75Li66YKu566x5Zyw5Z2ALCDmr5TlpoIgXCJuYW1lQGV4YW1wbGUuY29tXCInO1xuICAgICAgY2FzZSAnaG9zdG5hbWUnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuS4u+acuuWQjSwg5q+U5aaCIFwiZXhhbXBsZS5jb21cIic7XG4gICAgICBjYXNlICdpcHY0JzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLogSVB2NCDlnLDlnYAsIOavlOWmgiBcIjEyNy4wLjAuMVwiJztcbiAgICAgIGNhc2UgJ2lwdjYnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uiBJUHY2IOWcsOWdgCwg5q+U5aaCIFwiMTIzNDo1Njc4OjlBQkM6REVGMDoxMjM0OjU2Nzg6OUFCQzpERUYwXCInO1xuICAgICAgLy8gVE9ETzogYWRkIGV4YW1wbGVzIGZvciAndXJpJywgJ3VyaS1yZWZlcmVuY2UnLCBhbmQgJ3VyaS10ZW1wbGF0ZSdcbiAgICAgIC8vIGNhc2UgJ3VyaSc6IGNhc2UgJ3VyaS1yZWZlcmVuY2UnOiBjYXNlICd1cmktdGVtcGxhdGUnOlxuICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLogdXJsLCDmr5TlpoIgXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3BhZ2UuaHRtbFwiJztcbiAgICAgIGNhc2UgJ3V1aWQnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uiB1dWlkLCDmr5TlpoIgXCIxMjM0NTY3OC05QUJDLURFRjAtMTIzNC01Njc4OUFCQ0RFRjBcIic7XG4gICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIHJldHVybiAn5b+F6aG75Li66aKc6Imy5YC8LCDmr5TlpoIgXCIjRkZGRkZGXCIg5oiW6ICFIFwicmdiKDI1NSwgMjU1LCAyNTUpXCInO1xuICAgICAgY2FzZSAnanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLogSlNPTiBQb2ludGVyLCDmr5TlpoIgXCIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWxhdGl2ZS1qc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuebuOWvueeahCBKU09OIFBvaW50ZXIsIOavlOWmgiBcIjIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWdleCc6XG4gICAgICAgIHJldHVybiAn5b+F6aG75Li65q2j5YiZ6KGo6L6+5byPLCDmr5TlpoIgXCIoMS0pP1xcXFxkezN9LVxcXFxkezN9LVxcXFxkezR9XCInO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLrmoLzlvI/mraPnoa7nmoQgJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ+W/hemhu+Wkp+S6juaIluiAheetieS6juacgOWwj+WAvDoge3ttaW5pbXVtVmFsdWV9fScsXG4gIGV4Y2x1c2l2ZU1pbmltdW06ICflv4XpobvlpKfkuo7mnIDlsI/lgLw6IHt7ZXhjbHVzaXZlTWluaW11bVZhbHVlfX0nLFxuICBtYXhpbXVtOiAn5b+F6aG75bCP5LqO5oiW6ICF562J5LqO5pyA5aSn5YC8OiB7e21heGltdW1WYWx1ZX19JyxcbiAgZXhjbHVzaXZlTWF4aW11bTogJ+W/hemhu+Wwj+S6juacgOWkp+WAvDoge3tleGNsdXNpdmVNYXhpbXVtVmFsdWV9fScsXG4gIG11bHRpcGxlT2Y6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIGlmICgoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSkgJSAxMCA9PT0gMCkge1xuICAgICAgY29uc3QgZGVjaW1hbHMgPSBNYXRoLmxvZzEwKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpO1xuICAgICAgcmV0dXJuIGDlv4XpobvmnIkgJHtkZWNpbWFsc30g5L2N5oiW5pu05bCR55qE5bCP5pWw5L2NYDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGDlv4XpobvkuLogJHtlcnJvci5tdWx0aXBsZU9mVmFsdWV9IOeahOWAjeaVsGA7XG4gICAgfVxuICB9LFxuICBtaW5Qcm9wZXJ0aWVzOiAn6aG555uu5pWw5b+F6aG75aSn5LqO5oiW6ICF562J5LqOIHt7bWluaW11bVByb3BlcnRpZXN9fSAo5b2T5YmN6aG555uu5pWwOiB7e2N1cnJlbnRQcm9wZXJ0aWVzfX0pJyxcbiAgbWF4UHJvcGVydGllczogJ+mhueebruaVsOW/hemhu+Wwj+S6juaIluiAheetieS6jiB7e21heGltdW1Qcm9wZXJ0aWVzfX0gKOW9k+WJjemhueebruaVsDoge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1pbkl0ZW1zOiAn6aG555uu5pWw5b+F6aG75aSn5LqO5oiW6ICF562J5LqOIHt7bWluaW11bUl0ZW1zfX0gKOW9k+WJjemhueebruaVsDoge3tjdXJyZW50SXRlbXN9fSknLFxuICBtYXhJdGVtczogJ+mhueebruaVsOW/hemhu+Wwj+S6juaIluiAheetieS6jiB7e21heGltdW1JdGVtc319ICjlvZPliY3pobnnm67mlbA6IHt7Y3VycmVudEl0ZW1zfX0pJyxcbiAgdW5pcXVlSXRlbXM6ICfmiYDmnInpobnnm67lv4XpobvmmK/llK/kuIDnmoQnLFxuICAvLyBOb3RlOiBObyBkZWZhdWx0IGVycm9yIG1lc3NhZ2VzIGZvciAndHlwZScsICdjb25zdCcsICdlbnVtJywgb3IgJ2RlcGVuZGVuY2llcydcbn07XG4iXX0=