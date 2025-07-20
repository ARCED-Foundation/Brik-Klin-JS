import pandas as pd
import json
import os

# File paths
first_excel_path = 'MapLibreGLJSFromNetStart/Excel to JSON/data/allInfo.xlsx'  # First Excel file
second_excel_path = 'MapLibreGLJSFromNetStart/Excel to JSON/data/upazila_treat_assignment.xlsx'  # Second Excel file
output_geojson_path = 'kilns_with_exclude.geojson'  # Final output file

def convert_and_update_geojson():
    try:
        # Step 1: Convert the first Excel file to GeoJSON
        # Verify the first Excel file exists
        if not os.path.exists(first_excel_path):
            raise FileNotFoundError(f"First Excel file does not exist at: {first_excel_path}")
        if not os.path.isfile(first_excel_path):
            raise ValueError(f"The path is not a file: {first_excel_path}")
        if not os.access(first_excel_path, os.R_OK):
            raise PermissionError(f"No read permission for: {first_excel_path}")

        # Read the first Excel file
        print(f"Reading first Excel file from: {first_excel_path}")
        df1 = pd.read_excel(first_excel_path)
        print("First Excel data loaded successfully")

        # Replace NaN with "NaN" string for NAME column
        df1['NAME'] = df1['NAME'].fillna("NaN")

        # Convert to GeoJSON
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }

        for _, row in df1.iterrows():
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
                    "NAME": row['NAME'],
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

        print("Initial GeoJSON created successfully")

        # Step 2: Update GeoJSON with exclude from the second Excel file
        # Verify the second Excel file exists
        if not os.path.exists(second_excel_path):
            raise FileNotFoundError(f"Second Excel file does not exist at: {second_excel_path}")
        if not os.path.isfile(second_excel_path):
            raise ValueError(f"The path is not a file: {second_excel_path}")
        if not os.access(second_excel_path, os.R_OK):
            raise PermissionError(f"No read permission for: {second_excel_path}")

        # Read the second Excel file
        print(f"Reading second Excel file from: {second_excel_path}")
        df2 = pd.read_excel(second_excel_path)
        print("Second Excel data loaded successfully")

        # Create a dictionary mapping Upazila to exclude
        upazila_exclude_map = dict(zip(df2['Upazila'], df2['exclude']))
        print("Upazila to exclude mapping created:", upazila_exclude_map)

        # Update GeoJSON with exclude values
        updated_count = 0
        for feature in geojson['features']:
            upazila = feature['properties'].get('Upazila')
            if upazila in upazila_exclude_map:
                feature['properties']['exclude'] = upazila_exclude_map[upazila]
                updated_count += 1
            # Optionally set exclude to None for unmatched Upazilas (remove if not needed)
            elif 'exclude' not in feature['properties']:
                feature['properties']['exclude'] = None

        print(f"Updated {updated_count} features with exclude values")

        # Export the final GeoJSON
        with open(output_geojson_path, 'w') as f:
            json.dump(geojson, f, indent=2)
        print(f"Final GeoJSON exported to '{output_geojson_path}'")

    except Exception as e:
        print(f"Error processing files: {str(e)}")

# Run the script
if __name__ == "__main__":
    convert_and_update_geojson()