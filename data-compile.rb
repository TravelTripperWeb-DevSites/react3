require 'json'
require 'yaml'
require 'digest'

t = Time.now
path = File.expand_path(__FILE__).split("/")
path.pop
path = path.join("/")

START = File.join(path, "24NorthData", "_data")

file_contents = {}
Dir.glob(File.join(START,  "**", "*")).each do |file_path|
  next if File.directory?(file_path)
  file_content = File.read(file_path)
  sha256 = Digest::SHA256.file file_path
  data_path = file_path.gsub(START, '')
  file_contents[data_path] = sha256.hexdigest
  #
  #
  # #puts file_content
  # #puts data_path
  # keys = data_path.split("/")
  # keys.shift
  # fname = keys.pop
  # fname_ftype = fname.split(".")
  # fname = fname_ftype[0]
  # ftype = fname_ftype[1]
  # if ftype.downcase == "json"
  #   file_data = JSON.parse(file_content)
  # else
  #   file_data = YAML.load(file_content)
  # end
  # root = file_contents
  # keys.each do |key|
  #   root[key] ||= {}
  #   root = root[key]
  # end
  # root[fname] = file_data
end
File.write(File.join(path, "24NorthData", "data.json"), file_contents.to_json)
#puts file_contents


puts Time.now - t

