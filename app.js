var fs = require('fs');
var parse = require('csv-parse');
 
var inputFile='files/input.csv';

var out_data = [];

var headers = [];

var containsEID = function(eid){
    if(eid==="1234"){
        return false;
    }else{
        return true;
    }
}

function index_for_data(eid, fullname){
    for(var i=0; i < out_data.length; i++){
        if(eid === out_data[i].eid){
            return i;
        }
    }

    out_data.push({
         "eid" : eid
        ,"fullname" : fullname
        ,"addresses" : []
        ,"classes" : []
        ,"invisible" : false
        ,"see_all" : false
        }
    );

    return i;

}

function only_unique(value, index, self) { 
    return self.indexOf(value) === index;
}

function split_data_string(data_string){
    var str_array = [];
    if(data_string.includes(",")){
        str_array = str_array.concat(data_string.split(","));
    }
    else if(data_string.includes("/")){
        str_array = str_array.concat(data_string.split("/"));
    }
    else{
        str_array.push(data_string);
    }
    
    for(var i = 0; i < str_array.length; i++){
        str_array[i] = str_array[i].trim();
    }

    return str_array.filter(String);
}

function parse_header(element){

    var element_arr = element.split(" ");

    var tags = [];
    if(element_arr.length > 1){
        var tag_string = element.substring(element.indexOf(" "), element.length);
        
        tags = split_data_string(tag_string);

        tags = tags.filter(only_unique);

    }

    return {
        "name" : element_arr[0],
        "tags" : tags
    }

}

function add_class(data_index,data){
    var classes = out_data[data_index].classes;
    classes = classes.concat(split_data_string(data));
    out_data[data_index].classes =  classes.filter(only_unique);
}

function add_address(data_index, data, type, tags){

    out_data[data_index].addresses.push({
        "type" : type,
        "tags" : tags,
        "address" : data
    });

}
 

function set_invisible(data_index,data){
    if(data == "1"){
        out_data[data_index].invisible = true;
    }
} 

function set_see_all(data_index,data){
    if(data == "yes"){
        out_data[data_index].see_all = true;
    }
    else if(data == "no"){
        out_data[data_index].see_all = false;
    }
}

var parser = parse({delimiter: ','}, function (err, data) {

    var readingHeader = true;
    data.forEach(function(row) {

        if(!readingHeader){
            var fullname = row[0];
            var eid = row[1];

            var data_index = index_for_data(eid,fullname);

            for(var i=2; i < row.length; i++){
                if(headers[i].name === "class"){
                    add_class(data_index, row[i]);
                }

                if(headers[i].name === "email" || headers[i].name === "phone"){
                    add_address(data_index, row[i], headers[i].name, headers[i].tags);
                }

                if(headers[i].name === "invisible"){
                    set_invisible(data_index, row[i]);
                }

                if(headers[i].name === "see_all"){
                    set_see_all(data_index, row[i]);
                }
            }
        }

        else{
            row.forEach(function(element){
                headers.push(parse_header(element));
            });

            readingHeader = false;
        }
     
    });    
    //console.log(out_data);
    //console.log(JSON.stringify(out_data));
});
 
fs.createReadStream(inputFile).pipe(parser);