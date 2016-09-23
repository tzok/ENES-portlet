#! /usr/bin/env python2
# coding=utf-8

from __future__ import print_function

import argparse
import json
import os
import pycurl
import urllib


def get_png(workflow_details, user, password, png_name, output_path):
    """
    Given base url, username and password,
    provides the output file
    """
    base_url = workflow_details['base_url'].replace('http', 'https')
    session_id = workflow_details['session']
    workflow_id = workflow_details['workflow_id']
    png_url = base_url + '/sessions.php/' + session_id + "/export/misc/" + workflow_id + '/' + png_name

    post_data = {'username': user, 'password': password.rstrip('\n'), 'submit': '"login"'}
    postfields = urllib.urlencode(post_data)

    with open(output_path, 'w') as output_file:
        target = pycurl.Curl()
        target.setopt(target.URL, str(png_url))
        target.setopt(target.WRITEFUNCTION, output_file.write)
        target.setopt(target.POSTFIELDS, postfields)
        target.setopt(pycurl.COOKIEJAR, 'ophidia_cookie')
        target.setopt(pycurl.COOKIEFILE, 'ophidia_cookie')
        target.setopt(target.FOLLOWLOCATION, True)
        target.setopt(target.SSL_VERIFYPEER, 0)
        target.perform()
        result = target.getinfo(pycurl.HTTP_CODE)
        target.close()

    os.remove('ophidia_cookie')
    return result == 200


def get_workflow_details(file_stream, step):
    """
    Parses json stream, to grab workflow and marker IDs
    """
    json_data = json.loads(file_stream)
    response = json_data["response"]["response"]
    workflow_status = response[0]['objcontent'][0]['message']

    if workflow_status == "OPH_STATUS_COMPLETED":
        workflow_responses = response[2]
        content = workflow_responses["objcontent"]
        rows = content[0]['rowvalues']

        for r in rows:
            if r[5] == step:
                return {'base_url': r[0].split('/sessions')[0], 'session': r[1], 'workflow_id': r[2],
                        'marker_id': r[3]}

    raise RuntimeError('Invalid JSON file')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='This script parses Ophidia JSON output and grabs the PNG image')
    parser.add_argument('json_input', help='Path to the JSON input file')
    parser.add_argument('ophidia_step', help='Name of the Ophidia step where PNG is produced')
    parser.add_argument('credentials', help='Path to the file containing username and password for Ophidia server')
    parser.add_argument('png_name', help='Name of the remote PNG image')
    parser.add_argument('output_file', help='Path to the PNG output file')
    args = parser.parse_args()

    with open(args.credentials) as credentials_file:
        credentials = credentials_file.read()
        user, password = credentials.split(':')

    with open(args.json_input) as json_file:
        json_input = json_file.read()

    workflow_details = get_workflow_details(json_input, args.ophidia_step)
    exit(get_png(workflow_details, user, password, args.png_name, args.output_file))
