import pandas as pd
import json
import os

default_excel_path = 'MapLibreGLJSFromNetStart/Excel to JSON/data/allInfo.xlsx'  
default_upazila_treat_path = 'MapLibreGLJSFromNetStart/Excel to JSON/data/upazila_treat_assignment.xlsx'  

def get_the_control_Data():
    try:
        # Verify the file exists and is accessible
        if not os.path.exists(default_upazila_treat_path):
            raise FileNotFoundError(f"The file does not exist at: {default_upazila_treat_path}")
        if not os.path.isfile(default_upazila_treat_path):
            raise ValueError(f"The path is not a file: {default_upazila_treat_path}")
        if not os.access(default_upazila_treat_path, os.R_OK):
            raise PermissionError(f"No read permission for: {default_upazila_treat_path}")
        

        print(f"Reading Excel file from: {default_upazila_treat_path}")
        df = pd.read_excel(default_upazila_treat_path)
        print("Excel data loaded successfully")

        # Replace NaN with "NaN" string for consistency (optional, based on your previous preference)
        df = df.fillna(0)

        # Convert DataFrame to a list of dictionaries
        json_data = []

        for _, row in df.iterrows():
            entry = {
                "Upazila": row['Upazila'],
                "exclude": row['exclude'],
            }
            json_data.append(entry)

        print("JSON data created successfully")

        # Export to a file
        with open('controlInfo.json', 'w') as f:
            json.dump(json_data, f, indent=2)
        print("JSON exported to 'upazila_data.json'")
            
    
    except Exception as e:
        print(f"Error extracting exclude column: {str(e)}")


def convert_excel_to_geojson():
    try:
        # Verify the file exists and is accessible
        if not os.path.exists(default_excel_path):
            raise FileNotFoundError(f"The file does not exist at: {default_excel_path}")
        if not os.path.isfile(default_excel_path):
            raise ValueError(f"The path is not a file: {default_excel_path}")
        if not os.access(default_excel_path, os.R_OK):
            raise PermissionError(f"No read permission for: {default_excel_path}")

        # Read the Excel file using pandas
        print(f"Reading Excel file from: {default_excel_path}")
        df = pd.read_excel(default_excel_path)
        print("Excel data loaded successfully")

        # Replace NaN with "NaN" string for the NAME column (and others if desired)
        df['NAME'] = df['NAME'].fillna("NaN")  # Convert NaN to "NaN" string for NAME
        
        # Convert DataFrame to GeoJSON format
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }

        for _, row in df.iterrows():
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        float(row['Longitude (Decimal Degrees)']),
                        float(row['Latitude (Decimal Degrees)'])
                    ]
                },
                "properties": {
                    "FID": row['FID'],
                    "Deaths": row['Deaths'],
                    "Type_correct": row['Type_correct'],
                    "Union": row['Union'],
                    "ADM4_PCODE": row['ADM4_PCODE'],
                    "Upazila": row['Upazila'],
                    "ADM3_PCODE": row['ADM3_PCODE'],
                    "_ID": row['_ID'],
                    "color": row['color'],
                    "District": row['District'],
                    "ADM2_PCODE": row['ADM2_PCODE'],
                    "uid": row['uid'],
                    "health_harm_index_numerical": row['health_harm_index_numerical'],
                    "NAME": row['NAME'],  # Now guaranteed to be a string
                    "metre_to_school": row['metre_to_school'],
                    "metre_to_clinic": row['metre_to_clinic'],
                    "1km_school": row['1km_school'],
                    "1km_clinic": row['1km_clinic'],
                    "2km_forest": row['2km_forest'],
                    "1km_pa": row['1km_pa'],
                    "1km_railway": row['1km_railway'],
                    "1km_wetland": row['1km_wetland'],
                    "google_map": row['google_map'],
                    "Division": row['Division'],
                    "in_paurashava": row['in_paurashava'],
                    "Deaths_10yr": row['Deaths_10yr'],
                    "Deaths over 10 years": row['Deaths over 10 years'],
                    "harm_range": row['harm_range'],
                    "deaths_10yr_limited": row['deaths_10yr_limited']
                }
            }
            geojson["features"].append(feature)

        print("GeoJSON created successfully")

        # Export to a file
        with open('kilns.geojson', 'w') as f:
            json.dump(geojson, f, indent=2)
        print("GeoJSON exported to 'kilns.geojson'")

    except Exception as e:
        print(f"Error converting Excel to GeoJSON: {str(e)}")

# Run the conversion
if __name__ == "__main__":
    convert_excel_to_geojson()
    get_the_control_Data()