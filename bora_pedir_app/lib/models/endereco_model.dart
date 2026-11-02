class EnderecoModel {
  final int? id;
  final int? clienteId;
  final String nomeEndereco;
  final String cep;
  final String endereco;
  final String numero;
  final String? complemento;
  final String bairro;
  final String cidade;
  final String estado;
  final String? referencia;

  EnderecoModel({
    this.id,
    this.clienteId,
    required this.nomeEndereco,
    required this.cep,
    required this.endereco,
    required this.numero,
    this.complemento,
    required this.bairro,
    required this.cidade,
    required this.estado,
    this.referencia,
  });

  factory EnderecoModel.fromJson(Map<String, dynamic> json) {
    return EnderecoModel(
      id: json['id'] == null
          ? null
          : int.parse(json['id'].toString()),
      clienteId: json['cliente_id'] == null
          ? null
          : int.parse(json['cliente_id'].toString()),
      nomeEndereco: json['nome_endereco'] ?? '',
      cep: json['cep'] ?? '',
      endereco: json['endereco'] ?? '',
      numero: json['numero'] ?? '',
      complemento: json['complemento'],
      bairro: json['bairro'] ?? '',
      cidade: json['cidade'] ?? '',
      estado: json['estado'] ?? '',
      referencia: json['referencia'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nome_endereco': nomeEndereco,
      'cep': cep,
      'endereco': endereco,
      'numero': numero,
      'complemento': complemento,
      'bairro': bairro,
      'cidade': cidade,
      'estado': estado,
      'referencia': referencia,
    };
  }
}